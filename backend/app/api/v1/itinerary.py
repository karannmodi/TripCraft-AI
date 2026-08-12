from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.itinerary import (
    ItineraryDayResponse,
    ItineraryActivityResponse,
    ItineraryActivityUpdate,
)
from app.services.ollama_service import OllamaAIService
from app.services import itinerary_service

router = APIRouter()


def get_ai_service() -> OllamaAIService:
    """Dependency provider for OllamaAIService."""
    return OllamaAIService()


@router.get(
    "/trips/{trip_id}/itinerary",
    response_model=List[ItineraryDayResponse],
    summary="Get Day-by-Day Itinerary for a Trip"
)
async def get_itinerary(
    trip_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve existing day-by-day itinerary records and activities for a trip."""
    return await itinerary_service.get_trip_itinerary(db, trip_id)


@router.post(
    "/trips/{trip_id}/itinerary/generate",
    response_model=List[ItineraryDayResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI Itinerary via Ollama"
)
async def generate_itinerary(
    trip_id: str,
    overwrite: bool = Query(False, description="Set to true to overwrite existing itinerary"),
    db: AsyncSession = Depends(get_db),
    ai_service: OllamaAIService = Depends(get_ai_service)
):
    """Generate structured itinerary using Ollama gemma3:1b local LLM, validate with Pydantic, and persist in PostgreSQL."""
    return await itinerary_service.generate_and_save_itinerary(
        db=db,
        trip_id=trip_id,
        ai_service=ai_service,
        overwrite=overwrite
    )


@router.put(
    "/trips/{trip_id}/itinerary/activities/{activity_id}",
    response_model=ItineraryActivityResponse,
    summary="Update Itinerary Activity"
)
async def update_activity(
    trip_id: str,
    activity_id: str,
    payload: ItineraryActivityUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update editable details of an itinerary activity."""
    return await itinerary_service.update_activity(db, activity_id, payload)


@router.delete(
    "/trips/{trip_id}/itinerary/activities/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Itinerary Activity"
)
async def delete_activity(
    trip_id: str,
    activity_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete an activity from an itinerary day."""
    await itinerary_service.delete_activity(db, activity_id)
    return None
