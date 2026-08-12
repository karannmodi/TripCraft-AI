import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # Flight, Hotel, Transport, Activity, Restaurant
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    confirmation_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # NUMERIC(10,2) currency for reservation cost
    cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.00, nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), default="Confirmed", nullable=False)  # Confirmed, Pending, Cancelled
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="reservations")
