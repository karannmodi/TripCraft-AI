from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ItineraryActivityBase(BaseModel):
    time_slot: str = Field("Morning", description="Time slot (Morning, Afternoon, Evening, Night)")
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Estimated activity cost")
    category: str = Field("Sightseeing", description="Category tag")
    order_index: int = Field(0, ge=0)


class ItineraryActivityCreate(ItineraryActivityBase):
    pass


class ItineraryActivityResponse(ItineraryActivityBase):
    id: str
    itinerary_day_id: str

    model_config = ConfigDict(from_attributes=True)


class ItineraryDayResponse(BaseModel):
    id: str
    trip_id: str
    day_number: int
    date: date
    title: str
    notes: Optional[str] = None
    activities: List[ItineraryActivityResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
