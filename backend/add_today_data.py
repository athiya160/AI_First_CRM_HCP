import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, Base, engine
from app.models.hcp import HCP
from app.models.interaction import Interaction
from app.models.follow_up import FollowUp

def add_today_data():
    print("Connecting to database...")
    db = SessionLocal()
    
    try:
        now = datetime.now()
        
        # Ensure at least one doctor exists
        doctor = db.query(HCP).first()
        if not doctor:
            doctor = HCP(name="Dr. Sarah Johnson", email="sarah.j@example.com", specialty="Endocrinology")
            db.add(doctor)
            db.commit()
            db.refresh(doctor)
            
        print(f"Adding interactions and follow-ups for {doctor.name} for TODAY ({now.strftime('%Y-%m-%d')})...")
        
        interaction1 = Interaction(
            hcp_id=doctor.id,
            type="Meeting",
            date=now,
            notes="Morning meeting to discuss the new Q3 drug pipeline. Dr. Sarah was very excited about the upcoming cardiology trial and requested a follow-up with the medical science liaison.",
            summary="Discussed Q3 pipeline. Expressed excitement for cardiology trial.",
            sentiment="Positive",
            confidence=92,
            entities=["Q3 drug pipeline", "cardiology trial", "medical science liaison"],
            action_items=["Follow up with MSL for detailed trial data"]
        )
        
        interaction2 = Interaction(
            hcp_id=doctor.id,
            type="Call",
            date=now,
            notes="Brief check-in call regarding the sample deliveries. Confirmed receipt.",
            summary="Confirmed receipt of sample deliveries.",
            sentiment="Neutral",
            confidence=85,
            entities=["sample deliveries"],
            action_items=[]
        )
        
        db.add_all([interaction1, interaction2])
        
        follow_up = FollowUp(
            hcp_id=doctor.id,
            date=now,
            description="Urgent: Send cardiology trial literature to Dr. Sarah as requested this morning.",
            status="pending"
        )
        
        db.add(follow_up)
        
        db.commit()
        print("Today's data added successfully!")
        
    except Exception as e:
        print(f"Error adding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_today_data()
