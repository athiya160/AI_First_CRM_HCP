from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FollowUpBase(BaseModel):
    date: datetime
    description: str
    status: Optional[str] = "pending"

class FollowUpCreate(FollowUpBase):
    hcp_id: int
    interaction_id: Optional[int] = None

class FollowUpResponse(FollowUpBase):
    id: int
    hcp_id: int
    interaction_id: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
