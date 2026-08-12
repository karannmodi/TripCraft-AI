import json
import logging
from datetime import date, timedelta
from typing import Dict, List, Any, Optional
import httpx

from app.core.config import settings
from app.services.ai_interface import BaseAIService
from app.schemas.itinerary import AIItineraryDay

logger = logging.getLogger(__name__)


class OllamaServiceException(Exception):
    """Base exception for Ollama service errors."""
    pass


class OllamaOfflineException(OllamaServiceException):
    """Raised when Ollama server is offline or unreachable."""
    pass


class OllamaValidationException(OllamaServiceException):
    """Raised when Ollama output fails Pydantic validation or completeness checks after retries."""
    pass


class OllamaAIService(BaseAIService):
    """
    Ollama AI Service implementation of BaseAIService.
    Generates structured day-by-day trip itineraries using local Ollama instance (gemma3:1b).
    Validates every single day with Pydantic and application completeness checks.
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
        """
        Generate 2–3 structured activities for a single specific trip date.
        Validates output with Pydantic and allows 1 controlled retry on error.
        """
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
            '    },\n'
            '    {\n'
            '      "time_slot": "Evening",\n'
            '      "title": "Evening Dinner & Nightlife",\n'
            '      "description": "Relaxing dinner at a renowned restaurant",\n'
            f'      "location": "{destination}",\n'
            '      "estimated_cost": 45.00,\n'
            '      "category": "Dining",\n'
            '      "order_index": 2\n'
            '    }\n'
            '  ]\n'
            '}\n'
        )

        # Attempt 1
        raw_text = await self._call_ollama(prompt, system_prompt)
        validated_day = self._parse_and_validate_day(raw_text, day_number, date_str)

        if validated_day is None or len(validated_day.activities) < 2:
            # Attempt 2: Controlled Retry with explicit feedback
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
        """
        Generate complete multi-day itinerary by calculating all calendar dates,
        generating each day reliably via Ollama, validating each day, and performing
        application-level completeness checks.
        """
        start_date_val = trip_context.get("start_date")
        end_date_val = trip_context.get("end_date")

        if isinstance(start_date_val, str):
            start_date = date.fromisoformat(start_date_val)
        else:
            start_date = start_date_val

        if isinstance(end_date_val, str):
            end_date = date.fromisoformat(end_date_val)
        else:
            end_date = end_date_val

        if not start_date or not end_date or end_date < start_date:
            raise ValueError("Invalid trip date range for itinerary generation.")

        # Calculate exact list of calendar dates
        num_days = (end_date - start_date).days + 1
        required_dates = [start_date + timedelta(days=i) for i in range(num_days)]

        assembled_days: List[AIItineraryDay] = []

        # Generate day by day in strict chronological order
        for idx, cur_date in enumerate(required_dates):
            day_num = idx + 1
            day_obj = await self.generate_day_itinerary(trip_context, day_num, cur_date)
            assembled_days.append(day_obj)

        # Application-level completeness validation checks
        self._verify_completeness(assembled_days, required_dates)

        return [day.model_dump() for day in assembled_days]

    def _parse_and_validate_day(
        self, raw_text: str, expected_day_number: int, expected_date_str: str
    ) -> Optional[AIItineraryDay]:
        """Parse JSON raw output into Pydantic AIItineraryDay model."""
        try:
            cleaned = raw_text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()

            data = json.loads(cleaned)

            # If response is wrapped in a root object like {"days": [...]} or {"day": ...}
            if isinstance(data, dict):
                if "days" in data and isinstance(data["days"], list) and len(data["days"]) > 0:
                    data = data["days"][0]
                elif "day" in data and isinstance(data["day"], dict):
                    data = data["day"]

            # Force expected day_number and date from application logic
            data["day_number"] = expected_day_number
            data["date"] = expected_date_str

            validated = AIItineraryDay.model_validate(data)
            return validated
        except Exception as exc:
            logger.warning(f"Day {expected_day_number} JSON/Pydantic validation error: {exc}")
            return None

    def _verify_completeness(self, days: List[AIItineraryDay], required_dates: List[date]) -> None:
        """
        Application-level completeness validation:
        1. Number of generated days == number of required trip dates
        2. Every required date appears exactly once in order
        3. Every day has at least 2 activities
        4. Estimated costs are non-negative Decimal values
        """
        if len(days) != len(required_dates):
            raise OllamaValidationException(
                f"Completeness Check Failed: Generated {len(days)} days, but trip requires {len(required_dates)} days."
            )

        for idx, (day_obj, req_date) in enumerate(zip(days, required_dates)):
            expected_num = idx + 1
            if day_obj.day_number != expected_num:
                raise OllamaValidationException(
                    f"Completeness Check Failed: Day {expected_num} has invalid day_number {day_obj.day_number}."
                )

            if len(day_obj.activities) < 2:
                raise OllamaValidationException(
                    f"Completeness Check Failed: Day {day_obj.day_number} ({req_date}) has only {len(day_obj.activities)} activities (minimum 2 required)."
                )

            for act in day_obj.activities:
                if act.estimated_cost < 0:
                    raise OllamaValidationException(
                        f"Completeness Check Failed: Activity '{act.title}' has negative estimated cost ${act.estimated_cost}."
                    )

    async def generate_packing_list(self, trip_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        return []

    async def generate_chat_response(
        self, trip_context: Dict[str, Any], chat_history: List[Dict[str, Any]], user_message: str
    ) -> str:
        return ""

    async def generate_trip_summary(self, trip_context: Dict[str, Any]) -> str:
        prompt = f"Summarize this trip: {trip_context.get('title')} to {trip_context.get('destination')} in 2 sentences."
        return await self._call_ollama(prompt)
