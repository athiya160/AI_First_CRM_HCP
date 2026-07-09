from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class HCPBase(BaseModel):
    name: str
    specialty: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class HCPCreate(HCPBase):
    pass

class HCPResponse(HCPBase):
    id: int
    created_at: datetime
    
    # Allows Pydantic to read data from SQLAlchemy ORM models
    model_config = ConfigDict(from_attributes=True)
