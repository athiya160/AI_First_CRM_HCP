from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.database import Base

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    hcp_id: Mapped[int] = mapped_column(ForeignKey("hcp.id", ondelete="CASCADE"), index=True)
    interaction_id: Mapped[Optional[int]] = mapped_column(ForeignKey("interactions.id", ondelete="CASCADE"), index=True)
    
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # 'pending', 'completed', 'cancelled'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hcp: Mapped["HCP"] = relationship("HCP", back_populates="follow_ups")
    interaction: Mapped[Optional["Interaction"]] = relationship("Interaction", back_populates="follow_ups")
