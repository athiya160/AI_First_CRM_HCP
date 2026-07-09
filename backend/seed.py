import os
import sys
from datetime import datetime, timedelta

# Add the backend directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, Base, engine
from app.models.hcp import HCP
from app.models.interaction import Interaction
from app.models.follow_up import FollowUp

def seed_db():
    print("Connecting to database...")
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        print("Clearing old data...")
        db.query(FollowUp).delete()
        db.query(Interaction).delete()
        db.query(HCP).delete()
        
        print("Seeding Doctors (HCPs)...")
        doctors = [
            HCP(name="Dr. Sarah Johnson", email="sarah.j@example.com", specialty="Endocrinology"),
            HCP(name="Dr. Michael Chen", email="m.chen@example.com", specialty="Cardiology"),
            HCP(name="Dr. Emily Davis", email="emily.davis@example.com", specialty="Primary Care"),
            HCP(name="Dr. Robert Wilson", email="r.wilson@example.com", specialty="Neurology"),
        ]
        db.add_all(doctors)
        db.commit()
        
        # Refresh to get IDs
        for d in doctors:
            db.refresh(d)
            
        print("Seeding Interactions...")
        now = datetime.now()
        
        interactions = [
            Interaction(
                hcp_id=doctors[0].id,
                type="Meeting",
                date=now - timedelta(days=2),
                notes="Discussed new diabetes medicine efficacy. Dr. Sarah was very receptive and wants to start a trial with 5 patients.",
                summary="Discussed diabetes medicine; receptive to trial."
            ),
            Interaction(
                hcp_id=doctors[0].id,
                type="Email",
                date=now - timedelta(days=5),
                notes="Sent clinical trial data for the new insulin pump as requested.",
                summary="Emailed clinical trial data."
            ),
            Interaction(
                hcp_id=doctors[1].id,
                type="Call",
                date=now - timedelta(days=1),
                notes="Brief call regarding hypertension guidelines. He asked for more literature on our new beta-blocker.",
                summary="Call about hypertension; requested literature."
            ),
            Interaction(
                hcp_id=doctors[2].id,
                type="Visit",
                date=now - timedelta(days=10),
                notes="Routine clinic visit. Dropped off samples of seasonal allergy medication. Staff was friendly.",
                summary="Dropped off allergy samples."
            )
        ]
        db.add_all(interactions)
        
        print("Seeding Follow-ups...")
        follow_ups = [
            FollowUp(
                hcp_id=doctors[0].id,
                date=now + timedelta(days=5),
                description="Check in on the 5 patient trial for the diabetes medicine.",
                status="pending"
            ),
            FollowUp(
                hcp_id=doctors[1].id,
                date=now + timedelta(days=1),
                description="Send the requested beta-blocker literature.",
                status="pending"
            ),
            FollowUp(
                hcp_id=doctors[2].id,
                date=now - timedelta(days=2),
                description="Follow up on allergy samples.",
                status="completed"
            )
        ]
        db.add_all(follow_ups)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
