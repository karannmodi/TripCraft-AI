from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.services.reservation_service import ReservationService

router = APIRouter(tags=["Reservations"])


@router.get("/trips/{trip_id}/reservations", response_model=List[ReservationResponse])
async def get_trip_reservations(trip_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all reservation records for a given trip."""
    return await ReservationService.get_reservations(db, trip_id)


@router.post("/trips/{trip_id}/reservations", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(trip_id: str, data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    """Create a new reservation record associated with a trip."""
    return await ReservationService.create_reservation(db, trip_id, data)


@router.put("/trips/reservations/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(reservation_id: str, data: ReservationUpdate, db: AsyncSession = Depends(get_db)):
    """Update fields of an existing reservation record."""
    return await ReservationService.update_reservation(db, reservation_id, data)


@router.delete("/trips/reservations/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(reservation_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a reservation record by ID."""
    await ReservationService.delete_reservation(db, reservation_id)
    return None
