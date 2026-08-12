from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator, field_serializer


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

    @field_validator("title", "destination", mode="after")
    @classmethod
    def validate_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be blank or whitespace-only")
        return v.strip()

    @model_validator(mode="after")
    def validate_date_range(self) -> "TripBase":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot occur before start date")
        return self


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

    @field_validator("title", "destination", mode="after")
    @classmethod
    def validate_not_blank_optional(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Field cannot be blank or whitespace-only")
            return v.strip()
        return v

    @model_validator(mode="after")
    def validate_update_date_range(self) -> "TripUpdate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot occur before start date")
        return self


class TripResponse(TripBase):
    id: str
    created_at: datetime
    updated_at: datetime

    @field_serializer("budget_estimated", mode="plain", check_fields=False)
    def serialize_decimal(self, v: Optional[Decimal], _info) -> Optional[str]:
        if v is None:
            return None
        return f"{v:.2f}"

    model_config = ConfigDict(from_attributes=True)

