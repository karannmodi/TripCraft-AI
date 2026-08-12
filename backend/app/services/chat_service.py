from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.trip import Trip
from app.models.chat import ChatMessage
from app.services.ai_interface import BaseAIService
from app.services.itinerary_service import get_trip_itinerary
from app.services.reservation_service import ReservationService
from app.services.budget_service import BudgetService
from app.services.packing_service import PackingService
from app.services.ollama_service import OllamaOfflineException, OllamaServiceException


class ChatService:
    @staticmethod
    async def get_chat_history(db: AsyncSession, trip_id: str) -> List[ChatMessage]:
        """Retrieve previous Q&A chat messages for a trip."""
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        stmt = select(ChatMessage).where(ChatMessage.trip_id == trip_id).order_by(ChatMessage.timestamp.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def ask_trip_assistant(
        db: AsyncSession, trip_id: str, user_message: str, ai_service: BaseAIService
    ) -> ChatMessage:
        """
        Context-aware Q&A assistant:
        1. Deterministically calculates/retrieves facts from PostgreSQL FIRST.
        2. Answers factual questions directly using exact DB calculations.
        3. Uses Ollama for natural narrative synthesis (e.g. "Summarize my trip").
        4. Saves user prompt and response to database.
        """
        # Fetch Trip record
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        trip = res_trip.scalar_one_or_none()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with ID '{trip_id}' not found.")

        # Save user message to database
        user_msg_db = ChatMessage(
            trip_id=trip_id,
            sender="user",
            message=user_message,
            timestamp=datetime.utcnow()
        )
        db.add(user_msg_db)
        await db.flush()

        # Gather factual context from PostgreSQL
        itinerary = await get_trip_itinerary(db, trip_id)
        reservations = await ReservationService.get_reservations(db, trip_id)
        budget = await BudgetService.get_budget_summary(db, trip_id)
        packing_items = await PackingService.get_packing_items(db, trip_id)

        # Deterministic analysis
        msg_lower = user_message.lower().strip()
        assistant_reply: Optional[str] = None

        # 1. Reservations Query
        if any(w in msg_lower for w in ["reservation", "reservations", "booking", "bookings"]):
            if not reservations:
                assistant_reply = f"You do not have any saved reservations for '{trip.title}' yet."
            else:
                res_lines = [
                    f"• {r.title} ({r.type}) — Provider: {r.provider or 'N/A'}, Code: {r.confirmation_code or 'N/A'}, Cost: ${float(r.cost):.2f} [{r.status}]"
                    for r in reservations
                ]
                assistant_reply = f"You have {len(reservations)} confirmed reservation(s) for '{trip.title}':\n" + "\n".join(res_lines)

        # 2. Budget Spent Query
        elif any(w in msg_lower for w in ["how much spent", "spent", "actual spent", "total spent", "how much of my budget have i spent"]):
            assistant_reply = (
                f"You have spent ${float(budget.total_actual_spending):,.2f} in actual expenses "
                f"out of your ${float(budget.trip_budget_estimated):,.2f} trip budget. "
                f"(Your total estimated spending is ${float(budget.total_estimated_spending):,.2f})."
            )

        # 3. Budget Remaining Query
        elif any(w in msg_lower for w in ["budget remaining", "remaining budget", "budget left", "how much budget"]):
            assistant_reply = (
                f"You have ${float(budget.actual_budget_remaining):,.2f} remaining in actual budget "
                f"(${float(budget.estimated_budget_remaining):,.2f} remaining in estimated budget) "
                f"out of your ${float(budget.trip_budget_estimated):,.2f} allocation."
            )

        # 4. Most Activities Query
        elif any(w in msg_lower for w in ["most activities", "busiest day", "which day has"]):
            if not itinerary:
                assistant_reply = "No itinerary days have been generated yet for this trip."
            else:
                busiest_day = max(itinerary, key=lambda d: len(d.activities))
                assistant_reply = (
                    f"Day {busiest_day.day_number} ({busiest_day.date}) has the most activities, "
                    f"with {len(busiest_day.activities)} planned activities."
                )

        # 5. Still Need to Pack Query
        elif any(w in msg_lower for w in ["still need to pack", "to pack", "unpacked"]):
            unpacked = [i for i in packing_items if not i.is_packed]
            if not packing_items:
                assistant_reply = "No packing items have been generated or added yet for this trip."
            elif not unpacked:
                assistant_reply = f"Great job! All {len(packing_items)} items on your packing list are packed."
            else:
                item_names = ", ".join(i.item_name for i in unpacked[:6])
                more_cnt = len(unpacked) - 6
                suffix = f" and {more_cnt} more..." if more_cnt > 0 else "."
                assistant_reply = (
                    f"You have {len(unpacked)} out of {len(packing_items)} items left to pack, including: {item_names}{suffix}"
                )

        # 6. Natural Language Synthesis via Ollama (e.g. "Summarize my trip" or narrative queries)
        if assistant_reply is None:
            # Build comprehensive factual context for Ollama
            itin_summary = "; ".join(f"Day {d.day_number} ({d.date}): {len(d.activities)} activities" for d in itinerary) if itinerary else "None"
            res_summary = "; ".join(f"{r.title} ({r.type}, ${float(r.cost):.2f})" for r in reservations) if reservations else "None"
            pack_summary = f"{sum(1 for i in packing_items if i.is_packed)}/{len(packing_items)} packed" if packing_items else "0 items"

            context_str = (
                f"Trip Title: '{trip.title}' to {trip.destination}\n"
                f"Dates: {trip.start_date} to {trip.end_date}\n"
                f"Travelers: {trip.travelers_count}\n"
                f"Interests: {', '.join(trip.interests or [])}\n"
                f"Trip Budget: ${float(budget.trip_budget_estimated):,.2f}\n"
                f"Actual Spent: ${float(budget.total_actual_spending):,.2f}\n"
                f"Actual Remaining: ${float(budget.actual_budget_remaining):,.2f}\n"
                f"Itinerary Days: {len(itinerary)} days ({itin_summary})\n"
                f"Reservations: {res_summary}\n"
                f"Packing Progress: {pack_summary}\n"
            )

            try:
                assistant_reply = await ai_service.generate_chat_response(
                    trip_context={"context_summary": context_str},
                    chat_history=[],
                    user_message=user_message
                )
            except OllamaOfflineException as exc:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
            except OllamaServiceException as exc:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI service error: {exc}") from exc

        # Save assistant reply to database
        asst_msg_db = ChatMessage(
            trip_id=trip_id,
            sender="assistant",
            message=assistant_reply,
            timestamp=datetime.utcnow()
        )
        db.add(asst_msg_db)
        await db.commit()
        await db.refresh(asst_msg_db)

        return asst_msg_db
