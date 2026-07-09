# AI-First CRM for HCPs - Backend

This is the FastAPI backend for the AI-First CRM for Healthcare Professionals.

## Architecture & Folder Structure

- `app/api/`: Contains all REST API endpoints. Empty placeholders have been created for routing.
- `app/core/`: Application configurations, primarily the `config.py` which loads environment variables via `pydantic-settings`.
- `app/crud/`: Functions for Create, Read, Update, and Delete operations for our database tables.
- `app/db/`: Database configuration, including SQLAlchemy engine and session setup (`database.py`).
- `app/models/`: SQLAlchemy ORM models defining the database schema structure.
- `app/schemas/`: Pydantic models for data validation, serialization, and deserialization.
- `app/services/`: Core business logic, including the AI capabilities.
  - `app/services/ai/`: LangGraph integration. Holds the agent definition, state management, and tools.
- `app/main.py`: The FastAPI application entry point, containing CORS configuration and initialization.

## Setup Instructions

1.  **Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    ```
2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` and fill in the required values (like `DATABASE_URL` and `GROQ_API_KEY`).
4.  **Run Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
