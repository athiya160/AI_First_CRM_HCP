from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.hcp import HCP
from app.schemas.hcp import HCPCreate

def get_hcp(db: Session, hcp_id: int):
    return db.execute(select(HCP).where(HCP.id == hcp_id)).scalar_one_or_none()

def get_hcps(db: Session, skip: int = 0, limit: int = 100):
    return db.execute(select(HCP).offset(skip).limit(limit)).scalars().all()

def create_hcp(db: Session, hcp: HCPCreate):
    db_hcp = HCP(**hcp.model_dump())
    db.add(db_hcp)
    db.commit()
    db.refresh(db_hcp)
    return db_hcp

def update_hcp(db: Session, hcp_id: int, hcp_data: dict):
    db_hcp = get_hcp(db, hcp_id)
    if db_hcp:
        for key, value in hcp_data.items():
            setattr(db_hcp, key, value)
        db.commit()
        db.refresh(db_hcp)
    return db_hcp

def delete_hcp(db: Session, hcp_id: int):
    db_hcp = get_hcp(db, hcp_id)
    if db_hcp:
        db.delete(db_hcp)
        db.commit()
    return db_hcp
