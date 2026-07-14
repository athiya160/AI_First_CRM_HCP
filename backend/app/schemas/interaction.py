from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class InteractionBase(BaseModel):
    date: Optional[datetime] = None
    type: str  # e.g., 'email', 'meeting', 'call'
    notes: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[int] = None
    entities: Optional[List[str]] = None
    action_items: Optional[List[str]] = None

class InteractionCreate(InteractionBase):
    hcp_id: int

class InteractionResponse(InteractionBase):
    id: int
    hcp_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
