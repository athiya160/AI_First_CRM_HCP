import json
from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from sqlalchemy import select
from app.core.config import settings

from app.db.database import SessionLocal
from app.models.hcp import HCP
from app.crud.hcp import create_hcp
from app.schemas.hcp import HCPCreate
from app.models.interaction import Interaction
from app.crud.interaction import create_interaction, update_interaction, get_interaction
from app.schemas.interaction import InteractionCreate
from app.crud.follow_up import create_follow_up
from app.schemas.follow_up import FollowUpCreate

class LogExtractionSchema(BaseModel):
    summary: str = Field(description="A brief professional summary of the interaction.")
    sentiment: str = Field(description="The sentiment of the interaction. Must be 'Positive', 'Neutral', or 'Negative'.")
    confidence: int = Field(description="Confidence score of the extraction from 0 to 100.")
    entities: List[str] = Field(description="List of key entities extracted (e.g. medicines, conditions, locations).")
    action_items: List[str] = Field(description="List of required follow-up action items.")

class MultiInteractionSummarySchema(BaseModel):
    summary_bullets: List[str] = Field(description="List of bullet points summarizing the interactions.")
    overall_sentiment: str = Field(description="The overall sentiment across all interactions. Must be 'Positive', 'Neutral', or 'Negative'.")

@tool
def log_interaction(doctor_name: str, type: str, date: str, notes: str) -> str:
    """Log a new interaction with a healthcare professional (HCP)."""
    if not doctor_name or doctor_name.strip().lower() in ["", "unknown"]:
        return json.dumps({"success": False, "error": "Please ask the user which doctor they are referring to."})
    
    # 1. Use Groq llama-3.3-70b-versatile to extract structured data from notes
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(LogExtractionSchema)
    
    prompt = f"Analyze the following interaction notes and extract the required fields.\nNotes: {notes}"
    extracted_data = structured_llm.invoke(prompt)
    
    # 2. Database operations
    db = SessionLocal()
    try:
        # Clean up the name for a more robust search
        clean_name = doctor_name.replace("Dr.", "").replace("Dr ", "").strip()
        search_term = clean_name.split()[0] if clean_name else doctor_name
        
        # Search for the doctor by name
        stmt = select(HCP).where(HCP.name.ilike(f"%{search_term}%"))
        hcp = db.execute(stmt).scalars().first()
        
        # If doctor doesn't exist, create a stub for them
        if not hcp:
            new_hcp = HCPCreate(
                name=doctor_name, 
                email=f"{doctor_name.replace(' ', '').lower()}@example.com"
            )
            hcp = create_hcp(db, new_hcp)
            
        # Parse the date or fallback to now
        try:
            parsed_date = datetime.fromisoformat(date.replace("Z", "+00:00"))
        except ValueError:
            parsed_date = datetime.now()

        # 3. Save the interaction using the existing CRUD layer
        interaction_in = InteractionCreate(
            hcp_id=hcp.id,
            type=type,
            date=parsed_date,
            notes=notes,
            summary=extracted_data.summary
        )
        interaction = create_interaction(db, interaction_in)
        
        # 4. Return the structured JSON requested
        result = {
            "success": True,
            "interaction_id": interaction.id,
            "doctor": hcp.name,
            "summary": extracted_data.summary,
            "sentiment": extracted_data.sentiment,
            "confidence": extracted_data.confidence,
            "entities": extracted_data.entities,
            "action_items": extracted_data.action_items
        }
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: int, updated_notes: str) -> str:
    """Edit an existing interaction note and regenerate its AI summary."""
    
    # 1. Use Groq llama-3.3-70b-versatile to extract new structured data from the updated notes
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(LogExtractionSchema)
    
    prompt = f"Analyze the following updated interaction notes and extract the required fields.\nUpdated Notes: {updated_notes}"
    extracted_data = structured_llm.invoke(prompt)
    
    # 2. Database operations
    db = SessionLocal()
    try:
        # Verify the interaction exists
        interaction = get_interaction(db, interaction_id)
        if not interaction:
            # Get the 3 most recent interactions so the AI can suggest them
            recent = db.execute(select(Interaction).order_by(Interaction.date.desc()).limit(3)).scalars().all()
            recent_text = "\n".join([f"ID {r.id}: {r.type} on {r.date} with {r.hcp.name if r.hcp else 'Unknown'}" for r in recent])
            return json.dumps({
                "success": False, 
                "error": f"I couldn't find Interaction #{interaction_id}. Here are the most recent ones. Ask the user which one they want to edit:\n{recent_text}"
            })
            
        # 3. Update the interaction using the existing CRUD layer
        updated_data = {
            "notes": updated_notes,
            "summary": extracted_data.summary
        }
        updated_interaction = update_interaction(db, interaction_id, updated_data)
        
        # 4. Return the structured JSON requested
        result = {
            "success": True,
            "interaction_id": updated_interaction.id,
            "doctor": updated_interaction.hcp.name if updated_interaction.hcp else "Unknown",
            "summary": extracted_data.summary,
            "sentiment": extracted_data.sentiment,
            "confidence": extracted_data.confidence,
            "entities": extracted_data.entities,
            "action_items": extracted_data.action_items
        }
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()

@tool
def search_interaction(doctor_name: Optional[str] = None, interaction_type: Optional[str] = None, date: Optional[str] = None) -> str:
    """Search previous interactions by doctor name, interaction type, or date (YYYY-MM-DD)."""
    db = SessionLocal()
    try:
        # Join HCP to allow filtering by doctor name and eager loading
        stmt = select(Interaction).join(Interaction.hcp)
        
        if doctor_name:
            clean_name = doctor_name.replace("Dr.", "").replace("Dr ", "").strip()
            search_term = clean_name.split()[0] if clean_name else doctor_name
            stmt = stmt.where(HCP.name.ilike(f"%{search_term}%"))
        if interaction_type:
            stmt = stmt.where(Interaction.type.ilike(f"%{interaction_type}%"))
        if date:
            from sqlalchemy import cast, Date
            try:
                # Handle full ISO strings or just 'YYYY-MM-DD'
                parsed_date = datetime.fromisoformat(date.replace("Z", "+00:00")).date()
                stmt = stmt.where(cast(Interaction.date, Date) == parsed_date)
            except ValueError:
                pass # If date parsing fails, ignore the filter
                
        interactions = db.execute(stmt).scalars().all()
        
        results = []
        for inter in interactions:
            results.append({
                "interaction_id": inter.id,
                "doctor": inter.hcp.name if inter.hcp else "Unknown",
                "type": inter.type,
                "date": inter.date.isoformat() if inter.date else None,
                "notes": inter.notes,
                "summary": inter.summary
            })
            
        return json.dumps({"success": True, "count": len(results), "results": results}, indent=2)
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()

@tool
def summarize_interaction(doctor_name: str, limit: Union[int, str] = 10) -> str:
    """Summarize the last N meetings with a specific doctor."""
    db = SessionLocal()
    try:
        limit_val = int(limit) if limit else 10
        
        clean_name = doctor_name.replace("Dr.", "").replace("Dr ", "").strip()
        search_term = clean_name.split()[0] if clean_name else doctor_name
        
        # Fetch the last N interactions for the doctor, ordered by date descending
        stmt = select(Interaction).join(Interaction.hcp).where(
            HCP.name.ilike(f"%{search_term}%")
        ).order_by(Interaction.date.desc()).limit(limit_val)
        
        interactions = db.execute(stmt).scalars().all()
        
        if not interactions:
            return json.dumps({"success": False, "error": f"No interactions found for {doctor_name}."})
            
        # Format the interactions for the LLM
        history_text = "\n\n".join([f"Date: {i.date}\nType: {i.type}\nNotes: {i.notes}" for i in interactions])
        
        # Call Groq to summarize
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=settings.GROQ_API_KEY)
        structured_llm = llm.with_structured_output(MultiInteractionSummarySchema)
        
        prompt = f"Analyze the following {len(interactions)} past interactions with {doctor_name}. Summarize them into key bullet points and determine the overall relationship sentiment.\n\nInteractions:\n{history_text}"
        
        extracted = structured_llm.invoke(prompt)
        
        result = {
            "success": True,
            "doctor": interactions[0].hcp.name if interactions[0].hcp else doctor_name,
            "interaction_count": len(interactions),
            "summary_bullets": extracted.summary_bullets,
            "overall_sentiment": extracted.overall_sentiment
        }
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()

@tool
def schedule_follow_up(doctor_name: str, date: str, description: str) -> str:
    """Schedule a follow-up task for a doctor."""
    if not doctor_name or doctor_name.strip().lower() in ["", "unknown", "smith", "dr. smith", "dr smith"]:
        return json.dumps({"success": False, "error": "Please ask the user which doctor they are referring to."})
        
    db = SessionLocal()
    try:
        clean_name = doctor_name.replace("Dr.", "").replace("Dr ", "").strip()
        search_term = clean_name.split()[0] if clean_name else doctor_name
        
        stmt = select(HCP).where(HCP.name.ilike(f"%{search_term}%"))
        hcp = db.execute(stmt).scalars().first()
        
        if not hcp:
            new_hcp = HCPCreate(
                name=doctor_name, 
                email=f"{doctor_name.replace(' ', '').lower()}@example.com"
            )
            hcp = create_hcp(db, new_hcp)
            
        # Parse the date
        try:
            parsed_date = datetime.fromisoformat(date.replace("Z", "+00:00"))
        except ValueError:
            parsed_date = datetime.now()

        # 2. Save the follow-up using existing CRUD layer
        follow_up_in = FollowUpCreate(
            hcp_id=hcp.id,
            date=parsed_date,
            description=description,
            status="pending"
        )
        follow_up = create_follow_up(db, follow_up_in)
        
        # 3. Return the reminder details as structured JSON
        result = {
            "success": True,
            "follow_up_id": follow_up.id,
            "doctor": hcp.name,
            "date": follow_up.date.isoformat(),
            "description": follow_up.description,
            "status": follow_up.status
        }
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()

# List of tools to bind to the LLM and tool node
agent_tools = [
    log_interaction,
    edit_interaction,
    search_interaction,
    summarize_interaction,
    schedule_follow_up
]
