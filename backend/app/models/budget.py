import uuid
from datetime import date
from typing import Optional
from sqlalchemy import String, Boolean, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Lodging, Food, Transport, Activities, Shopping, Misc
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # NUMERIC(10, 2) currency for estimated and actual amounts
    estimated_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.00, nullable=True)
    actual_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.00, nullable=True)
    
    expense_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="expenses")
