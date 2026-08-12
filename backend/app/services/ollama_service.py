import json
import logging
from datetime import date, timedelta
from typing import Dict, List, Any, Optional
import httpx

from app.core.config import settings
from app.services.ai_interface import BaseAIService
from app.schemas.itinerary import AIItineraryDay
from app.schemas.packing import AIPackingList, AIPackingItem

logger = logging.getLogger(__name__)


class OllamaServiceException(Exception):
    """Base exception for Ollama service errors."""
    pass


class OllamaOfflineException(OllamaServiceException):
    """Raised when Ollama server is offline or unreachable."""
    pass


class OllamaValidationException(OllamaServiceException):
    """Raised when Ollama output fails Pydantic validation after retries."""
    pass


class OllamaAIService(BaseAIService):
    """
    Ollama AI Service implementation of BaseAIService.
    Generates structured day-by-day trip itineraries, packing lists, and natural language chat responses
    using local Ollama instance (gemma3:1b).
    """

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip('/')
        self.model = model or settings.OLLAMA_MODEL

    async def _call_ollama(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Helper to send prompt to Ollama /api/generate endpoint."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 500,
                "temperature": 0.3
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            timeout_cfg = httpx.Timeout(read=300.0, connect=15.0, write=30.0, pool=10.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    raise OllamaServiceException(f"Ollama returned HTTP {response.status_code}: {response.text}")
                data = response.json()
                return data.get("response", "")
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.NetworkError) as exc:
            logger.error(f"Ollama server offline or unreachable at {self.base_url}: {exc}")
            raise OllamaOfflineException(f"Ollama AI service is offline or unreachable at {self.base_url}.") from exc
        except (httpx.ReadTimeout, httpx.TimeoutException) as exc:
            logger.error(f"Ollama request timed out: {exc}")
            raise OllamaServiceException("Ollama generation timed out. Please try again.") from exc
        except httpx.HTTPError as exc:
            logger.error(f"Ollama HTTP error: {exc}")
            raise OllamaServiceException(f"Ollama communication failure: {exc}") from exc

    async def generate_day_itinerary(
        self, trip_context: Dict[str, Any], day_number: int, target_date: date
    ) -> AIItineraryDay:
        """Generate 2–3 structured activities for a single specific trip date."""
        title = trip_context.get("title", "Trip")
        destination = trip_context.get("destination", "Destination")
        travelers = trip_context.get("travelers_count", 1)
        budget = trip_context.get("budget_estimated", 0)
        interests = ", ".join(trip_context.get("interests", [])) if trip_context.get("interests") else "Sightseeing, Local Food"
        pace = trip_context.get("travel_pace", "Moderate")
        transport = trip_context.get("transportation_preference", "Public Transit")
        date_str = str(target_date)

        system_prompt = (
            "You are an expert travel planner. Return ONLY valid JSON for the requested day itinerary. "
            "Do not include markdown fences, comments, or explanations."
        )

        prompt = (
            f"Generate Day {day_number} ({date_str}) activities for '{title}' in {destination}.\n"
            f"Context: {travelers} travelers, budget ${budget}, interests: {interests}, pace: {pace}, transport: {transport}.\n"
            "Requirements:\n"
            "- Must contain at least 2 distinct activities (Morning, Afternoon, Evening).\n"
            "- Return JSON matching this exact structure:\n"
            "{\n"
            f'  "day_number": {day_number},\n'
            f'  "date": "{date_str}",\n'
            f'  "title": "Day {day_number}: Exploring {destination}",\n'
            '  "notes": "Highlights and recommendations for the day",\n'
            '  "activities": [\n'
            '    {\n'
            '      "time_slot": "Morning",\n'
            '      "title": "Morning Landmark Visit",\n'
            '      "description": "Explore popular morning sight",\n'
            f'      "location": "{destination}",\n'
            '      "estimated_cost": 25.00,\n'
            '      "category": "Sightseeing",\n'
            '      "order_index": 0\n'
            '    },\n'
            '    {\n'
            '      "time_slot": "Afternoon",\n'
            '      "title": "Local Lunch & Museum Walk",\n'
            '      "description": "Enjoy local cuisine and culture",\n'
            f'      "location": "{destination}",\n'
            '      "estimated_cost": 35.00,\n'
            '      "category": "Culture",\n'
            '      "order_index": 1\n'
            '    }\n'
            '  ]\n'
            '}\n'
        )

        raw_text = await self._call_ollama(prompt, system_prompt)
        validated_day = self._parse_and_validate_day(raw_text, day_number, date_str)

        if validated_day is None or len(validated_day.activities) < 2:
            retry_prompt = (
                f"{prompt}\n\n"
                "CRITICAL ERROR: Your previous output was invalid JSON or contained fewer than 2 activities. "
                "Output MUST be valid JSON with 'day_number', 'date', 'title', and an 'activities' array with at least 2 activity objects."
            )
            logger.warning(f"Attempt 1 for Day {day_number} failed validation. Initiating 1 controlled retry.")
            raw_text_2 = await self._call_ollama(retry_prompt, system_prompt)
            validated_day = self._parse_and_validate_day(raw_text_2, day_number, date_str)

        if validated_day is None or len(validated_day.activities) < 2:
            raise OllamaValidationException(
                f"Day {day_number} ({date_str}) failed Pydantic schema validation or completeness check (< 2 activities) after 1 retry."
            )

        return validated_day

    async def generate_itinerary(self, trip_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate complete multi-day itinerary by calculating all calendar dates."""
        start_date_val = trip_context.get("start_date")
        end_date_val = trip_context.get("end_date")

        start_date = date.fromisoformat(start_date_val) if isinstance(start_date_val, str) else start_date_val
        end_date = date.fromisoformat(end_date_val) if isinstance(end_date_val, str) else end_date_val

        if not start_date or not end_date or end_date < start_date:
            raise ValueError("Invalid trip date range for itinerary generation.")

        num_days = (end_date - start_date).days + 1
        required_dates = [start_date + timedelta(days=i) for i in range(num_days)]

        assembled_days: List[AIItineraryDay] = []
        for idx, cur_date in enumerate(required_dates):
            day_num = idx + 1
            day_obj = await self.generate_day_itinerary(trip_context, day_num, cur_date)
            assembled_days.append(day_obj)

        self._verify_completeness(assembled_days, required_dates)
        return [day.model_dump() for day in assembled_days]

    def _parse_and_validate_day(
        self, raw_text: str, expected_day_number: int, expected_date_str: str
    ) -> Optional[AIItineraryDay]:
        try:
            cleaned = self._clean_json_string(raw_text)
            data = json.loads(cleaned)

            if isinstance(data, dict):
                if "days" in data and isinstance(data["days"], list) and len(data["days"]) > 0:
                    data = data["days"][0]
                elif "day" in data and isinstance(data["day"], dict):
                    data = data["day"]

            data["day_number"] = expected_day_number
            data["date"] = expected_date_str
            return AIItineraryDay.model_validate(data)
        except Exception as exc:
            logger.warning(f"Day {expected_day_number} JSON validation error: {exc}")
            return None

    def _verify_completeness(self, days: List[AIItineraryDay], required_dates: List[date]) -> None:
        if len(days) != len(required_dates):
            raise OllamaValidationException(
                f"Completeness Check Failed: Generated {len(days)} days, but trip requires {len(required_dates)} days."
            )
        for idx, (day_obj, req_date) in enumerate(zip(days, required_dates)):
            if day_obj.day_number != idx + 1:
                raise OllamaValidationException(f"Completeness Check Failed: Day number mismatch for {req_date}.")
            if len(day_obj.activities) < 2:
                raise OllamaValidationException(f"Completeness Check Failed: Day {day_obj.day_number} has < 2 activities.")

    async def generate_packing_list(self, trip_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate structured packing list recommendations using local Ollama model."""
        destination = trip_context.get("destination", "Destination")
        title = trip_context.get("title", "Trip")
        travelers = trip_context.get("travelers_count", 1)
        interests = ", ".join(trip_context.get("interests", [])) if trip_context.get("interests") else "General Travel"
        activities = ", ".join(trip_context.get("activities", [])) if trip_context.get("activities") else "Sightseeing, Walking"

        system_prompt = (
            "You are an expert travel assistant. Return ONLY valid JSON for a travel packing checklist. "
            "Do not include markdown fences, comments, or explanations."
        )

        prompt = (
            f"Generate an essential packing checklist for '{title}' in {destination}.\n"
            f"Context: {travelers} travelers, interests: {interests}, planned activities: {activities}.\n"
            "Requirements:\n"
            "- Include 8 to 14 essential packing items grouped into categories: 'Clothing', 'Documents', 'Electronics', 'Toiletries', 'Activity-specific items', 'Miscellaneous'.\n"
            "- Return JSON matching this exact structure:\n"
            "{\n"
            '  "items": [\n'
            '    {"category": "Clothing", "item_name": "Comfortable Walking Shoes", "is_packed": false},\n'
            '    {"category": "Documents", "item_name": "Government ID / Passport", "is_packed": false},\n'
            '    {"category": "Electronics", "item_name": "Phone Charger & Power Bank", "is_packed": false},\n'
            '    {"category": "Toiletries", "item_name": "Travel-size Shampoo & Toothbrush", "is_packed": false},\n'
            '    {"category": "Activity-specific items", "item_name": "Camera for Architecture Tour", "is_packed": false},\n'
            '    {"category": "Miscellaneous", "item_name": "Reusable Water Bottle", "is_packed": false}\n'
            '  ]\n'
            '}\n'
        )

        raw_text = await self._call_ollama(prompt, system_prompt)
        validated = self._parse_and_validate_packing(raw_text)

        if validated is None or len(validated.items) == 0:
            retry_prompt = (
                f"{prompt}\n\n"
                "CRITICAL ERROR: Your previous output was invalid JSON or contained missing item_name fields. "
                "Output MUST be valid JSON with an 'items' array containing objects with 'category', 'item_name', and 'is_packed'."
            )
            logger.warning("Attempt 1 for Packing List failed validation. Initiating 1 controlled retry.")
            raw_text_2 = await self._call_ollama(retry_prompt, system_prompt)
            validated = self._parse_and_validate_packing(raw_text_2)

        if validated is None or len(validated.items) == 0:
            raise OllamaValidationException("Packing list generation failed Pydantic schema validation after 1 retry.")

        return [item.model_dump() for item in validated.items]

    def _parse_and_validate_packing(self, raw_text: str) -> Optional[AIPackingList]:
        try:
            cleaned = self._clean_json_string(raw_text)
            data = json.loads(cleaned)
            
            raw_items = []
            if isinstance(data, list):
                raw_items = data
            elif isinstance(data, dict):
                raw_items = data.get("items", [])
                if not raw_items and "packing_list" in data:
                    raw_items = data["packing_list"]
                elif not raw_items and "checklist" in data:
                    raw_items = data["checklist"]
            
            if not raw_items:
                return None

            normalized = []
            for item in raw_items:
                if not isinstance(item, dict):
                    continue
                cat = item.get("category") or item.get("group") or "General"
                name = item.get("item_name") or item.get("name") or item.get("item") or item.get("description")
                if not name or not str(name).strip():
                    continue
                packed = bool(item.get("is_packed", item.get("packed", item.get("item_packed", False))))
                normalized.append({
                    "category": str(cat).strip(),
                    "item_name": str(name).strip(),
                    "is_packed": packed
                })

            if not normalized:
                return None

            return AIPackingList.model_validate({"items": normalized})
        except Exception as exc:
            logger.warning(f"Packing list JSON validation error: {exc}")
            return None

    async def generate_chat_response(
        self, trip_context: Dict[str, Any], chat_history: List[Dict[str, Any]], user_message: str
    ) -> str:
        """Generate a natural-language narrative response using local Ollama model based strictly on supplied context."""
        context_summary = trip_context.get("context_summary", str(trip_context))

        system_prompt = (
            "You are TripCraft AI, a helpful, friendly travel assistant. "
            "You are provided with authoritative factual context retrieved directly from PostgreSQL. "
            "Your task is to provide a concise, natural-language response to the user's question using ONLY the provided facts. "
            "Do NOT invent, recalculate, or modify any dates, costs, or activities. "
            "If the information is not in the provided facts, state clearly that it is unavailable."
        )

        prompt = (
            f"Factual Trip Context:\n{context_summary}\n\n"
            f"User Question: \"{user_message}\"\n\n"
            "Answer concisely in 2 to 4 sentences:"
        )

        return await self._call_ollama(prompt, system_prompt)

    async def generate_trip_summary(self, trip_context: Dict[str, Any]) -> str:
        prompt = f"Summarize this trip in 2 sentences: {trip_context.get('title')} to {trip_context.get('destination')}."
        return await self._call_ollama(prompt)

    def _clean_json_string(self, text: str) -> str:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()
        return cleaned
