from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.packing import PackingItemCreate, PackingItemUpdate, PackingItemResponse
from app.services.packing_service import PackingService
from app.services.ollama_service import OllamaAIService

router = APIRouter(tags=["Packing Assistant"])
ai_service = OllamaAIService()


@router.get("/trips/{trip_id}/packing", response_model=List[PackingItemResponse])
async def get_packing_items(trip_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all packing items for a given trip."""
    return await PackingService.get_packing_items(db, trip_id)


@router.post("/trips/{trip_id}/packing/generate", response_model=List[PackingItemResponse])
async def generate_packing_list(trip_id: str, overwrite: bool = False, db: AsyncSession = Depends(get_db)):
    """Generate structured AI packing list recommendations via Ollama."""
    return await PackingService.generate_and_save_packing_list(db, trip_id, ai_service, overwrite=overwrite)


@router.post("/trips/{trip_id}/packing/items", response_model=PackingItemResponse, status_code=status.HTTP_201_CREATED)
async def create_packing_item(trip_id: str, data: PackingItemCreate, db: AsyncSession = Depends(get_db)):
    """Manually add a packing item to a trip."""
    return await PackingService.create_packing_item(db, trip_id, data)


@router.put("/trips/packing/items/{item_id}", response_model=PackingItemResponse)
async def update_packing_item(item_id: str, data: PackingItemUpdate, db: AsyncSession = Depends(get_db)):
    """Update a packing item (toggle is_packed status or edit item name/category)."""
    return await PackingService.update_packing_item(db, item_id, data)


@router.delete("/trips/packing/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_packing_item(item_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a packing item by ID."""
    await PackingService.delete_packing_item(db, item_id)
    return None
