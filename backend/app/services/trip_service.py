import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripUpdate


class TripService:
    @staticmethod
    async def create_trip(db: AsyncSession, trip_in: TripCreate) -> Trip:
        trip_data = trip_in.model_dump()
        db_trip = Trip(
            id=str(uuid.uuid4()),
            **trip_data
        )
        db.add(db_trip)
        await db.commit()
        await db.refresh(db_trip)
        return db_trip

    @staticmethod
    async def get_trips(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Trip]:
        query = select(Trip).order_by(Trip.start_date.asc(), Trip.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_trip_by_id(db: AsyncSession, trip_id: str) -> Optional[Trip]:
        query = select(Trip).where(Trip.id == trip_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_trip(db: AsyncSession, db_trip: Trip, trip_in: TripUpdate) -> Trip:
        update_data = trip_in.model_dump(exclude_unset=True)
        
        # If dates are updated individually, ensure cross-field date validation against existing model values
        new_start = update_data.get("start_date", db_trip.start_date)
        new_end = update_data.get("end_date", db_trip.end_date)
        if new_start and new_end and new_end < new_start:
            raise ValueError("End date cannot occur before start date")

        for field, value in update_data.items():
            setattr(db_trip, field, value)
        
        db_trip.updated_at = datetime.utcnow()
        db.add(db_trip)
        await db.commit()
        await db.refresh(db_trip)
        return db_trip

    @staticmethod
    async def delete_trip(db: AsyncSession, db_trip: Trip) -> None:
        await db.delete(db_trip)
        await db.commit()
