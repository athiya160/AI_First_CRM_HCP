from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.schemas.interaction import InteractionCreate, InteractionResponse
from app.crud import interaction as crud_interaction

router = APIRouter()

@router.get("/", response_model=List[InteractionResponse])
def get_interactions(hcp_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_interaction.get_interactions_by_hcp(db=db, hcp_id=hcp_id, skip=skip, limit=limit)

@router.post("/", response_model=InteractionResponse, status_code=201)
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    return crud_interaction.create_interaction(db=db, interaction=interaction)

@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(interaction_id: int, interaction_data: Dict[str, Any], db: Session = Depends(get_db)):
    updated = crud_interaction.update_interaction(db=db, interaction_id=interaction_id, interaction_data=interaction_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return updated

@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    deleted = crud_interaction.delete_interaction(db=db, interaction_id=interaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {"message": "Interaction deleted successfully"}
