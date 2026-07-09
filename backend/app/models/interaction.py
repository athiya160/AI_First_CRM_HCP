from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    hcp_id: Mapped[int] = mapped_column(ForeignKey("hcp.id", ondelete="CASCADE"), index=True)
    
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    type: Mapped[str] = mapped_column(String(50))  # e.g., 'email', 'meeting', 'call'
    notes: Mapped[Optional[str]] = mapped_column(Text)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hcp: Mapped["HCP"] = relationship("HCP", back_populates="interactions")
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="interaction", cascade="all, delete-orphan"
    )
