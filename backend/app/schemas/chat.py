from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ChatQueryInput(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt message")

    @field_validator("message", mode="before")
    @classmethod
    def validate_non_blank_message(cls, v: str) -> str:
        if isinstance(v, str) and not v.strip():
            raise ValueError("Message prompt cannot be blank.")
        return v.strip()


class ChatMessageResponse(BaseModel):
    id: str
    trip_id: str
    sender: str  # "user" or "assistant"
    message: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse] = Field(default_factory=list)
