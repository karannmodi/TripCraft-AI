from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class AIPackingItem(BaseModel):
    category: str = Field("General", description="Clothing, Documents, Electronics, Toiletries, Activity-specific items, Miscellaneous")
    item_name: str = Field(..., min_length=1, max_length=255, description="Item description")
    is_packed: bool = Field(False)


class AIPackingList(BaseModel):
    items: List[AIPackingItem] = Field(..., min_length=1)


class PackingItemBase(BaseModel):
    category: str = Field("General", description="Clothing, Documents, Electronics, Toiletries, Activity-specific items, Miscellaneous")
    item_name: str = Field(..., min_length=1, max_length=255)
    is_packed: bool = Field(False)
    is_ai_suggested: bool = Field(False)

    @field_validator("item_name", mode="before")
    @classmethod
    def validate_non_blank_item_name(cls, v: str) -> str:
        if isinstance(v, str) and not v.strip():
            raise ValueError("Item name cannot be blank.")
        return v


class PackingItemCreate(PackingItemBase):
    pass


class PackingItemUpdate(BaseModel):
    category: Optional[str] = None
    item_name: Optional[str] = None
    is_packed: Optional[bool] = None

    @field_validator("item_name", mode="before")
    @classmethod
    def validate_non_blank_item_name_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str) and not v.strip():
            raise ValueError("Item name cannot be blank.")
        return v


class PackingItemResponse(PackingItemBase):
    id: str
    trip_id: str

    model_config = ConfigDict(from_attributes=True)
