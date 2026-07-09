from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.follow_up import FollowUpResponse
from app.crud import follow_up as crud_follow_up

router = APIRouter()

@router.get("/", response_model=List[FollowUpResponse])
def get_follow_ups(hcp_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_follow_up.get_follow_ups_by_hcp(db=db, hcp_id=hcp_id, skip=skip, limit=limit)
