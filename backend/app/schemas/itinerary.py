from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_serializer, field_validator


class ItineraryActivityBase(BaseModel):
    time_slot: str = Field("Morning", description="Time slot (Morning, Afternoon, Evening, Night)")
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Estimated activity cost")
    category: str = Field("Sightseeing", description="Category tag")
    order_index: int = Field(0, ge=0)

    @field_serializer("estimated_cost")
    def serialize_cost(self, cost: Optional[Decimal], _info) -> Optional[str]:
        if cost is None:
            return "0.00"
        return f"{cost:.2f}"


class ItineraryActivityCreate(ItineraryActivityBase):
    pass


class ItineraryActivityUpdate(BaseModel):
    time_slot: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[Decimal] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=50)
    order_index: Optional[int] = Field(None, ge=0)


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


# Models for Pydantic validation of Ollama AI responses

class AIItineraryActivity(BaseModel):
    time_slot: str = Field("Morning")
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    location: Optional[str] = ""
    estimated_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    category: str = Field("Sightseeing")
    order_index: int = Field(0, ge=0)

    @field_validator("estimated_cost", mode="before")
    @classmethod
    def parse_cost(cls, v):
        if v is None or v == "":
            return Decimal("0.00")
        if isinstance(v, (int, float, str)):
            try:
                if isinstance(v, str):
                    v = v.replace("$", "").replace(",", "").strip()
                val = Decimal(str(v))
                return val if val >= 0 else Decimal("0.00")
            except Exception:
                return Decimal("0.00")
        return Decimal("0.00")


class AIItineraryDay(BaseModel):
    day_number: int = Field(..., ge=1)
    date: Optional[str] = None
    title: str = Field(..., min_length=1)
    notes: Optional[str] = ""
    activities: List[AIItineraryActivity] = Field(..., min_length=2, description="Must contain at least 2 activities per day")

    @field_validator("notes", mode="before")
    @classmethod
    def parse_notes(cls, v):
        if isinstance(v, list):
            return " ".join(str(item) for item in v)
        if v is None:
            return ""
        return str(v)

    @field_validator("title", mode="before")
    @classmethod
    def parse_title(cls, v):
        if not v:
            return "Day Itinerary"
        return str(v).strip()


class AIItineraryResponse(BaseModel):
    days: List[AIItineraryDay] = Field(..., min_length=1)
