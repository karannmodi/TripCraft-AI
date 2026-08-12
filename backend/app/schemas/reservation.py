from datetime import datetime
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator, field_serializer


class ReservationBase(BaseModel):
    type: str = Field(..., description="Lodging, Transportation, Restaurant, Activity")
    title: str = Field(..., min_length=1, max_length=255, description="Reservation title or name")
    provider: Optional[str] = Field(None, max_length=255)
    confirmation_code: Optional[str] = Field(None, max_length=100)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    cost: Decimal = Field(Decimal("0.00"), ge=0, description="Cost must be non-negative")
    status: str = Field("Confirmed", description="Confirmed, Pending, Cancelled")
    notes: Optional[str] = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_non_blank_title(cls, v: str) -> str:
        if isinstance(v, str) and not v.strip():
            raise ValueError("Reservation title cannot be blank.")
        return v

    @field_validator("cost", mode="before")
    @classmethod
    def parse_decimal_cost(cls, v: Any) -> Decimal:
        if v is None or v == "":
            return Decimal("0.00")
        if isinstance(v, (int, float, str)):
            cleaned = str(v).replace("$", "").replace(",", "").strip()
            val = Decimal(cleaned)
            if val < 0:
                raise ValueError("Cost cannot be negative.")
            return val
        return v

    @model_validator(mode="after")
    def check_dates_order(self) -> "ReservationBase":
        if self.start_time and self.end_time and self.end_time < self.start_time:
            raise ValueError("End date/time cannot be before start date/time.")
        return self


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    provider: Optional[str] = None
    confirmation_code: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    cost: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_non_blank_title_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str) and not v.strip():
            raise ValueError("Reservation title cannot be blank.")
        return v

    @field_validator("cost", mode="before")
    @classmethod
    def parse_decimal_cost_update(cls, v: Any) -> Optional[Decimal]:
        if v is None:
            return None
        cleaned = str(v).replace("$", "").replace(",", "").strip()
        val = Decimal(cleaned)
        if val < 0:
            raise ValueError("Cost cannot be negative.")
        return val


class ReservationResponse(ReservationBase):
    id: str
    trip_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("cost")
    def serialize_cost(self, cost: Decimal, _info) -> str:
        return f"{cost:.2f}"
