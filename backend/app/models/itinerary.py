import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import String, Integer, Text, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="itinerary_days")
    activities: Mapped[List["ItineraryActivity"]] = relationship("ItineraryActivity", back_populates="day", cascade="all, delete-orphan", order_by="ItineraryActivity.order_index")


class ItineraryActivity(Base):
    __tablename__ = "itinerary_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    itinerary_day_id: Mapped[str] = mapped_column(String(36), ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False)
    time_slot: Mapped[str] = mapped_column(String(50), default="Morning", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # NUMERIC(10,2) currency for estimated cost
    estimated_cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.00, nullable=True)
    
    category: Mapped[str] = mapped_column(String(50), default="Sightseeing", nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    day: Mapped["ItineraryDay"] = relationship("ItineraryDay", back_populates="activities")
