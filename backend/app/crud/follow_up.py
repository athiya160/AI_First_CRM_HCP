from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.follow_up import FollowUp
from app.schemas.follow_up import FollowUpCreate

def get_follow_up(db: Session, follow_up_id: int):
    return db.execute(select(FollowUp).where(FollowUp.id == follow_up_id)).scalar_one_or_none()

def get_follow_ups_by_hcp(db: Session, hcp_id: int, skip: int = 0, limit: int = 100):
    return db.execute(select(FollowUp).where(FollowUp.hcp_id == hcp_id).offset(skip).limit(limit)).scalars().all()

def create_follow_up(db: Session, follow_up: FollowUpCreate):
    db_follow_up = FollowUp(**follow_up.model_dump(exclude_unset=True))
    db.add(db_follow_up)
    db.commit()
    db.refresh(db_follow_up)
    return db_follow_up

def update_follow_up(db: Session, follow_up_id: int, follow_up_data: dict):
    db_follow_up = get_follow_up(db, follow_up_id)
    if db_follow_up:
        for key, value in follow_up_data.items():
            setattr(db_follow_up, key, value)
        db.commit()
        db.refresh(db_follow_up)
    return db_follow_up

def delete_follow_up(db: Session, follow_up_id: int):
    db_follow_up = get_follow_up(db, follow_up_id)
    if db_follow_up:
        db.delete(db_follow_up)
        db.commit()
    return db_follow_up
