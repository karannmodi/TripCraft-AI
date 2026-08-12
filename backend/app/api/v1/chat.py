from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.chat import ChatQueryInput, ChatMessageResponse, ChatHistoryResponse
from app.services.chat_service import ChatService
from app.services.ollama_service import OllamaAIService

router = APIRouter(tags=["Ask My Trip Assistant"])
ai_service = OllamaAIService()


@router.get("/trips/{trip_id}/chat", response_model=ChatHistoryResponse)
async def get_chat_history(trip_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve chat message history for a trip."""
    messages = await ChatService.get_chat_history(db, trip_id)
    return ChatHistoryResponse(messages=messages)


@router.post("/trips/{trip_id}/chat", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def ask_assistant(trip_id: str, data: ChatQueryInput, db: AsyncSession = Depends(get_db)):
    """Submit a question prompt to the Ask My Trip assistant."""
    return await ChatService.ask_trip_assistant(db, trip_id, data.message, ai_service)
