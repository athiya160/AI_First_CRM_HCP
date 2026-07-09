from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate

def get_interaction(db: Session, interaction_id: int):
    return db.execute(select(Interaction).where(Interaction.id == interaction_id)).scalar_one_or_none()

def get_interactions_by_hcp(db: Session, hcp_id: int, skip: int = 0, limit: int = 100):
    return db.execute(select(Interaction).where(Interaction.hcp_id == hcp_id).offset(skip).limit(limit)).scalars().all()

def create_interaction(db: Session, interaction: InteractionCreate):
    # exclude_unset=True ensures we don't accidentally override DB defaults with None
    db_interaction = Interaction(**interaction.model_dump(exclude_unset=True))
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def update_interaction(db: Session, interaction_id: int, interaction_data: dict):
    db_interaction = get_interaction(db, interaction_id)
    if db_interaction:
        for key, value in interaction_data.items():
            setattr(db_interaction, key, value)
        db.commit()
        db.refresh(db_interaction)
    return db_interaction

def delete_interaction(db: Session, interaction_id: int):
    db_interaction = get_interaction(db, interaction_id)
    if db_interaction:
        db.delete(db_interaction)
        db.commit()
    return db_interaction
