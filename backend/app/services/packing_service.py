from typing import List
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.trip import Trip
from app.models.packing import PackingItem
from app.schemas.packing import PackingItemCreate, PackingItemUpdate
from app.services.ai_interface import BaseAIService
from app.services.ollama_service import OllamaOfflineException, OllamaValidationException, OllamaServiceException
from app.services.itinerary_service import get_trip_itinerary


class PackingService:
    @staticmethod
    async def get_packing_items(db: AsyncSession, trip_id: str) -> List[PackingItem]:
        """Retrieve all packing list items for a trip."""
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        stmt = select(PackingItem).where(PackingItem.trip_id == trip_id).order_by(
            PackingItem.category.asc(), PackingItem.is_ai_suggested.desc(), PackingItem.item_name.asc()
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def generate_and_save_packing_list(
        db: AsyncSession, trip_id: str, ai_service: BaseAIService, overwrite: bool = False
    ) -> List[PackingItem]:
        """
        Generate AI packing items via Ollama, preserve manually added items,
        and atomically update PostgreSQL packing_items table.
        """
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        trip = res_trip.scalar_one_or_none()
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        # Check existing AI items
        existing_items = await PackingService.get_packing_items(db, trip_id)
        ai_items = [i for i in existing_items if i.is_ai_suggested]

        if ai_items and not overwrite:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="AI-generated packing items already exist. Confirmation required to regenerate."
            )

        # Gather itinerary context
        itinerary_days = await get_trip_itinerary(db, trip_id)
        activity_titles = []
        for day in itinerary_days:
            for act in day.activities:
                activity_titles.append(act.title)

        trip_context = {
            "title": trip.title,
            "destination": trip.destination,
            "start_date": str(trip.start_date),
            "end_date": str(trip.end_date),
            "travelers_count": trip.travelers_count,
            "interests": trip.interests or [],
            "activities": activity_titles,
            "transportation_preference": trip.transportation_preference,
        }

        # Call Ollama AI Service FIRST before database edits
        try:
            raw_items = await ai_service.generate_packing_list(trip_context)
        except OllamaOfflineException as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
        except OllamaValidationException as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI packing list validation failed: {exc}") from exc
        except OllamaServiceException as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI service error: {exc}") from exc

        # Safe Atomic update: delete ONLY AI-suggested items if overwrite=True (preserving manual items)
        if ai_items:
            del_stmt = delete(PackingItem).where(
                PackingItem.trip_id == trip_id,
                PackingItem.is_ai_suggested == True
            )
            await db.execute(del_stmt)
            await db.flush()

        for item_data in raw_items:
            new_item = PackingItem(
                trip_id=trip_id,
                category=item_data.get("category", "General"),
                item_name=item_data.get("item_name", "Essential Item"),
                is_packed=item_data.get("is_packed", False),
                is_ai_suggested=True,
            )
            db.add(new_item)

        await db.commit()
        return await PackingService.get_packing_items(db, trip_id)

    @staticmethod
    async def create_packing_item(db: AsyncSession, trip_id: str, data: PackingItemCreate) -> PackingItem:
        """Manually create a packing item (is_ai_suggested=False)."""
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        item = PackingItem(
            trip_id=trip_id,
            category=data.category,
            item_name=data.item_name,
            is_packed=data.is_packed,
            is_ai_suggested=False,  # Manual user item
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def update_packing_item(db: AsyncSession, item_id: str, data: PackingItemUpdate) -> PackingItem:
        """Update packing item fields (is_packed toggle or name/category edit)."""
        stmt = select(PackingItem).where(PackingItem.id == item_id)
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Packing item with ID '{item_id}' not found."
            )

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(item, key, value)

        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def delete_packing_item(db: AsyncSession, item_id: str) -> None:
        """Delete a packing item by ID."""
        stmt = select(PackingItem).where(PackingItem.id == item_id)
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Packing item with ID '{item_id}' not found."
            )

        await db.delete(item)
        await db.commit()
