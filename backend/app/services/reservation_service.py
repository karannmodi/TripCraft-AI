from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.trip import Trip
from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreate, ReservationUpdate


class ReservationService:
    @staticmethod
    async def get_reservations(db: AsyncSession, trip_id: str) -> List[Reservation]:
        """Retrieve all reservations for a given trip."""
        # Verify trip exists
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        stmt = select(Reservation).where(Reservation.trip_id == trip_id).order_by(Reservation.start_time.asc().nulls_last())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_reservation(db: AsyncSession, trip_id: str, data: ReservationCreate) -> Reservation:
        """Create a new reservation record associated with a trip."""
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        reservation = Reservation(
            trip_id=trip_id,
            type=data.type,
            title=data.title,
            provider=data.provider,
            confirmation_code=data.confirmation_code,
            start_time=data.start_time,
            end_time=data.end_time,
            cost=data.cost,
            status=data.status,
            notes=data.notes,
        )
        db.add(reservation)
        await db.commit()
        await db.refresh(reservation)
        return reservation

    @staticmethod
    async def update_reservation(db: AsyncSession, reservation_id: str, data: ReservationUpdate) -> Reservation:
        """Update fields of an existing reservation record."""
        stmt = select(Reservation).where(Reservation.id == reservation_id)
        res = await db.execute(stmt)
        reservation = res.scalar_one_or_none()
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation with ID '{reservation_id}' not found."
            )

        update_dict = data.model_dump(exclude_unset=True)
        
        # Verify date ordering if dates updated
        new_start = update_dict.get("start_time", reservation.start_time)
        new_end = update_dict.get("end_time", reservation.end_time)
        if new_start and new_end and new_end < new_start:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="End date/time cannot be before start date/time."
            )

        for key, value in update_dict.items():
            setattr(reservation, key, value)

        await db.commit()
        await db.refresh(reservation)
        return reservation

    @staticmethod
    async def delete_reservation(db: AsyncSession, reservation_id: str) -> None:
        """Delete a reservation record by ID."""
        stmt = select(Reservation).where(Reservation.id == reservation_id)
        res = await db.execute(stmt)
        reservation = res.scalar_one_or_none()
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation with ID '{reservation_id}' not found."
            )

        await db.delete(reservation)
        await db.commit()
