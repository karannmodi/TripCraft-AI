from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class TripBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Name or title of the trip")
    destination: str = Field(..., min_length=1, max_length=255, description="Destination city/country")
    start_date: date = Field(..., description="Trip start date")
    end_date: date = Field(..., description="Trip end date")
    travelers_count: int = Field(1, ge=1, description="Number of travelers")
    budget_estimated: Optional[Decimal] = Field(None, ge=0, description="Estimated total budget (Decimal)")
    interests: List[str] = Field(default_factory=list, description="Traveler interest tags")
    travel_pace: str = Field("Moderate", description="Pace preference (Slow, Moderate, Fast)")
    transportation_preference: str = Field("Public Transit", description="Preferred transport mode")


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    destination: Optional[str] = Field(None, min_length=1, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    travelers_count: Optional[int] = Field(None, ge=1)
    budget_estimated: Optional[Decimal] = Field(None, ge=0)
    interests: Optional[List[str]] = None
    travel_pace: Optional[str] = None
    transportation_preference: Optional[str] = None


class TripResponse(TripBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
