import uuid
from typing import Optional
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class PackingItem(Base):
    __tablename__ = "packing_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="General", nullable=False)  # Clothing, Toiletries, Electronics, Documents, Essentials
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_packed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_ai_suggested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="packing_items")
