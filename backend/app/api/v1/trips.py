from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.services.trip_service import TripService

router = APIRouter()


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED, summary="Create a new Trip")
@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_trip(
    trip_in: TripCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new Trip record in PostgreSQL."""
    try:
        return await TripService.create_trip(db, trip_in)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )


@router.get("", response_model=List[TripResponse], summary="List all Trips")
@router.get("/", response_model=List[TripResponse], include_in_schema=False)
async def list_trips(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all trips ordered by start date."""
    return await TripService.get_trips(db, skip=skip, limit=limit)



@router.get("/{trip_id}", response_model=TripResponse, summary="Get a Trip by ID")
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific trip by UUID."""
    trip = await TripService.get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID '{trip_id}' not found."
        )
    return trip


@router.put("/{trip_id}", response_model=TripResponse, summary="Update a Trip")
async def update_trip(
    trip_id: str,
    trip_in: TripUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update fields of an existing trip record."""
    trip = await TripService.get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID '{trip_id}' not found."
        )
    try:
        return await TripService.update_trip(db, trip, trip_in)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Trip")
async def delete_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a trip record from PostgreSQL."""
    trip = await TripService.get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID '{trip_id}' not found."
        )
    await TripService.delete_trip(db, trip)
    return None
