from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReservationBase(BaseModel):
    type: str = Field(..., description="Flight, Hotel, Transport, Activity, Restaurant")
    title: str = Field(..., min_length=1, max_length=255)
    provider: Optional[str] = None
    confirmation_code: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    cost: Optional[Decimal] = Field(Decimal("0.00"), ge=0)
    status: str = Field("Confirmed", description="Confirmed, Pending, Cancelled")
    notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    id: str
    trip_id: str

    model_config = ConfigDict(from_attributes=True)
