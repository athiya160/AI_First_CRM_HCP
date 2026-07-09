from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.hcp import HCPCreate, HCPResponse
from app.crud import hcp as crud_hcp

router = APIRouter()

@router.get("/", response_model=List[HCPResponse])
def get_hcps(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_hcp.get_hcps(db=db, skip=skip, limit=limit)

from sqlalchemy.exc import IntegrityError

@router.post("/", response_model=HCPResponse, status_code=201)
def create_hcp(hcp: HCPCreate, db: Session = Depends(get_db)):
    try:
        return crud_hcp.create_hcp(db=db, hcp=hcp)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered or unique constraint violated.")
