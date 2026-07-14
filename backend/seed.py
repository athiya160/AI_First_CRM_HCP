import os
import sys
import random
from datetime import datetime, timedelta

# Add the backend directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, Base, engine
from app.models.hcp import HCP
from app.models.interaction import Interaction
from app.models.follow_up import FollowUp

def generate_realistic_seed():
    print("Connecting to database...")
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        print("Clearing old data...")
        db.query(FollowUp).delete()
        db.query(Interaction).delete()
        db.query(HCP).delete()
        db.commit()
        
        print("Seeding 12 Doctors (HCPs)...")
        doctors_data = [
            ("Dr. Sarah Johnson", "Endocrinology"),
            ("Dr. Marcus Chen", "Neurology"),
            ("Dr. Emily Davis", "Primary Care"),
            ("Dr. Robert Wilson", "Cardiology"),
            ("Dr. Lisa Patel", "Oncology"),
            ("Dr. James Rodriguez", "Orthopedics"),
            ("Dr. Amanda Smith", "Pediatrics"),
            ("Dr. William Taylor", "Psychiatry"),
            ("Dr. Olivia Martinez", "Dermatology"),
            ("Dr. David Anderson", "Gastroenterology"),
            ("Dr. Sophia Kim", "Rheumatology"),
            ("Dr. Thomas Wright", "Pulmonology")
        ]
        
        doctors = []
        for name, spec in doctors_data:
            doc = HCP(name=name, email=f"{name.lower().replace(' ', '.').replace('dr.', '')}@hospital.com", specialty=spec)
            doctors.append(doc)
        
        db.add_all(doctors)
        db.commit()
        for d in doctors:
            db.refresh(d)
            
        print("Seeding 48 Interactions...")
        now = datetime.now()
        
        interaction_types = ["Meeting", "Call", "Email", "Visit"]
        sentiments = ["Positive", "Positive", "Positive", "Positive", "Neutral", "Neutral", "Negative"] # Weight heavily to Positive
        
        notes_templates = [
            "Discussed the efficacy of the new {drug} trial. Doctor was very receptive and requested literature.",
            "Quick check-in call regarding the {drug} samples delivered last week. Everything looks good.",
            "Detailed meeting on patient outcomes using {drug}. Showed 15% improvement in markers.",
            "Emailed the updated clinical guidelines for {drug} as requested during our last visit.",
            "Brief visit to the clinic. Left {drug} samples with the front desk. Staff was friendly.",
            "Addressed concerns about side effects of {drug}. Provided the latest safety profile documents.",
            "Doctor is highly interested in participating in the phase 3 trials for {drug}.",
            "Follow-up regarding the {drug} webinar. Doctor found it very informative."
        ]
        
        drugs = ["CardioMax", "NeuroSoothe", "EndoGluco", "PulmoBreath", "DermaClear", "OncoShield"]
        
        interactions = []
        # We need 48 interactions. Spread them out over the last 30 days.
        for i in range(48):
            doc = random.choice(doctors)
            i_type = random.choice(interaction_types)
            sentiment = random.choice(sentiments)
            
            # 8 of them should be 'Today' to make the UI look active today
            if i < 8:
                date = now - timedelta(hours=random.randint(1, 8))
            else:
                date = now - timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))
                
            drug = random.choice(drugs)
            note = random.choice(notes_templates).format(drug=drug)
            
            conf = random.randint(85, 99) if sentiment == "Positive" else random.randint(70, 90)
            
            summary = note.split(". ")[0] + "."
            action_items = ["Send literature"] if "requested" in note else []
            entities = [drug, doc.specialty]
            
            inter = Interaction(
                hcp_id=doc.id,
                type=i_type,
                date=date,
                notes=note,
                summary=summary,
                sentiment=sentiment,
                confidence=conf,
                entities=entities,
                action_items=action_items
            )
            interactions.append(inter)
            
        db.add_all(interactions)
        
        print("Seeding 5 Pending Follow-ups...")
        follow_ups = []
        for i in range(5):
            doc = random.choice(doctors)
            # Mix of due today, tomorrow, and overdue
            offset = random.choice([-1, 0, 1, 2])
            date = now + timedelta(days=offset)
            
            fu = FollowUp(
                hcp_id=doc.id,
                date=date,
                description=f"Send updated clinical trial data for {random.choice(drugs)}.",
                status="pending"
            )
            follow_ups.append(fu)
            
        # Add a couple completed ones
        for i in range(2):
            doc = random.choice(doctors)
            fu = FollowUp(
                hcp_id=doc.id,
                date=now - timedelta(days=random.randint(3, 10)),
                description="Follow up on samples dropped off.",
                status="completed"
            )
            follow_ups.append(fu)
            
        db.add_all(follow_ups)
        db.commit()
        
        print(f"Successfully seeded {len(doctors)} doctors, {len(interactions)} interactions, and {len(follow_ups)} follow-ups.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_realistic_seed()
