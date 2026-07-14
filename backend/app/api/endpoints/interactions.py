from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.schemas.interaction import InteractionCreate, InteractionResponse
from app.crud import interaction as crud_interaction
from app.crud import hcp as crud_hcp

router = APIRouter()

from typing import Optional

@router.get("/", response_model=List[InteractionResponse])
def get_interactions(hcp_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if hcp_id:
        return crud_interaction.get_interactions_by_hcp(db=db, hcp_id=hcp_id, skip=skip, limit=limit)
    
    # If no hcp_id, return all interactions
    from app.models.interaction import Interaction
    return db.query(Interaction).order_by(Interaction.date.desc()).offset(skip).limit(limit).all()

from pydantic import BaseModel
class AnalyzeRequest(BaseModel):
    notes: str

@router.post("/analyze")
def analyze_interaction_notes(request: AnalyzeRequest):
    from langchain_groq import ChatGroq
    from app.core.config import settings
    from app.services.ai.tools import LogExtractionSchema
    
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=settings.GROQ_API_KEY)
        structured_llm = llm.with_structured_output(LogExtractionSchema)
        prompt = f"Analyze the following interaction notes and extract the required fields.\nNotes: {request.notes}"
        extracted_data = structured_llm.invoke(prompt)
        
        return {
            "summary": extracted_data.summary,
            "sentiment": extracted_data.sentiment,
            "confidence": extracted_data.confidence,
            "entities": extracted_data.entities,
            "action_items": extracted_data.action_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=InteractionResponse, status_code=201)
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    hcp = crud_hcp.get_hcp(db, hcp_id=interaction.hcp_id)
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
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
