from datetime import timedelta, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryActivity
from app.schemas.itinerary import ItineraryActivityUpdate
from app.services.ai_interface import BaseAIService
from app.services.ollama_service import OllamaOfflineException, OllamaValidationException, OllamaServiceException


async def get_trip_itinerary(db: AsyncSession, trip_id: str) -> List[ItineraryDay]:
    """Retrieve all day-by-day itinerary records for a given trip with activities."""
    stmt = (
        select(ItineraryDay)
        .where(ItineraryDay.trip_id == trip_id)
        .options(selectinload(ItineraryDay.activities))
        .order_by(ItineraryDay.day_number)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def generate_and_save_itinerary(
    db: AsyncSession,
    trip_id: str,
    ai_service: BaseAIService,
    overwrite: bool = False
) -> List[ItineraryDay]:
    """
    Generate structured itinerary via AI service, verify completeness across all trip dates,
    and safely persist into PostgreSQL inside a single database transaction.
    """
    # 1. Fetch Trip details
    stmt = select(Trip).where(Trip.id == trip_id)
    result = await db.execute(stmt)
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with ID '{trip_id}' not found.")

    # 2. Check for existing itinerary
    existing_days = await get_trip_itinerary(db, trip_id)
    if existing_days and not overwrite:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An itinerary already exists for this trip. Confirmation required to overwrite."
        )

    # 3. Build trip context dictionary
    trip_context = {
        "title": trip.title,
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "travelers_count": trip.travelers_count,
        "budget_estimated": float(trip.budget_estimated) if trip.budget_estimated is not None else 0.0,
        "interests": trip.interests or [],
        "travel_pace": trip.travel_pace,
        "transportation_preference": trip.transportation_preference,
    }

    # 4. Generate structured itinerary day-by-day FIRST before modifying PostgreSQL
    try:
        raw_days = await ai_service.generate_itinerary(trip_context)
    except OllamaOfflineException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        ) from exc
    except OllamaValidationException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI itinerary generation failed validation: {exc}"
        ) from exc
    except OllamaServiceException as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {exc}"
        ) from exc

    # 5. ATOMIC PERSISTENCE: Now that all days passed generation & completeness checks, delete existing and insert new
    if existing_days:
        del_stmt = delete(ItineraryDay).where(ItineraryDay.trip_id == trip_id)
        await db.execute(del_stmt)
        await db.flush()

    num_days = (trip.end_date - trip.start_date).days + 1
    created_days: List[ItineraryDay] = []
    
    for i in range(num_days):
        day_number = i + 1
        calculated_date = trip.start_date + timedelta(days=i)
        
        matching_ai_day = raw_days[i] if i < len(raw_days) else {}
        day_title = matching_ai_day.get("title") or f"Day {day_number}: {trip.destination}"
        day_notes = matching_ai_day.get("notes") or ""

        db_day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_number,
            date=calculated_date,
            title=day_title,
            notes=day_notes
        )
        db.add(db_day)
        await db.flush()  # populate db_day.id

        activities_data = matching_ai_day.get("activities", [])
        for act_idx, act_item in enumerate(activities_data):
            cost_val = act_item.get("estimated_cost", 0.0)
            try:
                cost_decimal = Decimal(str(cost_val)) if cost_val is not None else Decimal("0.00")
                if cost_decimal < 0:
                    cost_decimal = Decimal("0.00")
            except Exception:
                cost_decimal = Decimal("0.00")

            db_act = ItineraryActivity(
                itinerary_day_id=db_day.id,
                time_slot=act_item.get("time_slot", "Morning"),
                title=act_item.get("title", f"Activity {act_idx + 1}"),
                description=act_item.get("description", ""),
                location=act_item.get("location", trip.destination),
                estimated_cost=cost_decimal,
                category=act_item.get("category", "Sightseeing"),
                order_index=act_item.get("order_index", act_idx)
            )
            db.add(db_act)

        created_days.append(db_day)

    # Commit transaction safely
    await db.commit()
    
    # Re-query with activities loaded
    return await get_trip_itinerary(db, trip_id)


async def update_activity(
    db: AsyncSession,
    activity_id: str,
    update_data: ItineraryActivityUpdate
) -> ItineraryActivity:
    """Update editable fields of an itinerary activity."""
    stmt = select(ItineraryActivity).where(ItineraryActivity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Itinerary activity with ID '{activity_id}' not found."
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(activity, key, value)

    await db.commit()
    await db.refresh(activity)
    return activity


async def delete_activity(db: AsyncSession, activity_id: str) -> None:
    """Delete an itinerary activity by ID."""
    stmt = select(ItineraryActivity).where(ItineraryActivity.id == activity_id)
    result = await db.execute(stmt)
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Itinerary activity with ID '{activity_id}' not found."
        )

    await db.delete(activity)
    await db.commit()
