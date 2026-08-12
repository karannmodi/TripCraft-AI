from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt message")


class ChatMessageResponse(BaseModel):
    id: str
    trip_id: str
    sender: str
    message: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
