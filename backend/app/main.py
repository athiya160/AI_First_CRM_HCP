from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
import app.models  # Crucial: Imports models so SQLAlchemy creates the tables

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS for the frontend Vite server
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api.endpoints import hcp, interactions, follow_ups, chat

# Register routers
app.include_router(hcp.router, prefix=f"{settings.API_V1_STR}/hcps", tags=["HCPs"])
app.include_router(interactions.router, prefix=f"{settings.API_V1_STR}/interactions", tags=["Interactions"])
app.include_router(follow_ups.router, prefix=f"{settings.API_V1_STR}/follow-ups", tags=["Follow-Ups"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-First CRM for HCPs Backend API"}
