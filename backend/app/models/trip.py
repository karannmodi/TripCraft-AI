import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import String, Integer, Numeric, Date, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    travelers_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # NUMERIC(10,2) for exact Decimal currency precision
    budget_estimated: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    
    interests: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=list)
    travel_pace: Mapped[str] = mapped_column(String(50), default="Moderate", nullable=False)
    transportation_preference: Mapped[str] = mapped_column(String(50), default="Public Transit", nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    itinerary_days: Mapped[List["ItineraryDay"]] = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan")
    reservations: Mapped[List["Reservation"]] = relationship("Reservation", back_populates="trip", cascade="all, delete-orphan")
    expenses: Mapped[List["Expense"]] = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    packing_items: Mapped[List["PackingItem"]] = relationship("PackingItem", back_populates="trip", cascade="all, delete-orphan")
    chat_messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="trip", cascade="all, delete-orphan")
