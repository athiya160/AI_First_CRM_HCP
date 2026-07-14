from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.follow_up import FollowUpResponse
from app.crud import follow_up as crud_follow_up

router = APIRouter()

from typing import Optional

@router.get("/", response_model=List[FollowUpResponse])
def get_follow_ups(hcp_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if hcp_id:
        return crud_follow_up.get_follow_ups_by_hcp(db=db, hcp_id=hcp_id, skip=skip, limit=limit)
        
    from app.models.follow_up import FollowUp
    return db.query(FollowUp).order_by(FollowUp.date.asc()).offset(skip).limit(limit).all()
