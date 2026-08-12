from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PackingItemBase(BaseModel):
    category: str = Field("General", description="Clothing, Toiletries, Electronics, Documents, Essentials")
    item_name: str = Field(..., min_length=1, max_length=255)
    is_packed: bool = Field(False)
    is_ai_suggested: bool = Field(False)


class PackingItemCreate(PackingItemBase):
    pass


class PackingItemResponse(PackingItemBase):
    id: str
    trip_id: str

    model_config = ConfigDict(from_attributes=True)
