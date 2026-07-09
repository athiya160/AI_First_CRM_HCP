# AI-First CRM HCP Module

## Project Overview
This project is an AI-powered Customer Relationship Management (CRM) system designed for Healthcare Professionals (HCPs). It enables pharmaceutical field representatives to manage doctor interactions through both a traditional form-based interface and an AI-powered conversational assistant.

The application combines React, FastAPI, PostgreSQL, LangGraph, and Groq LLM to automate interaction logging, generate summaries, extract medical entities, analyze sentiment, and schedule follow-up tasks.

---

## System Architecture

```text
Frontend (React + Redux)
        │
        │ Axios API Calls
        ▼
Backend (FastAPI)
        │
        ▼
LangGraph Agent
        │
        ├── Log Interaction
        ├── Edit Interaction
        ├── Search Interaction
        ├── Summarize Interaction
        └── Schedule Follow-up
        │
        ▼
PostgreSQL Database
```

---

## Features
- **Dashboard** with live HCP statistics and dynamic KPI cards.
- **Doctor Directory** with instantaneous search and specialty filtering.
- **Log Interaction Form** for traditional structured data entry.
- **AI Copilot Chat** for conversational data logging and retrieval.
- **AI Generated Summary** from raw meeting notes.
- **Medical Entity Extraction** (topics, conditions, medications).
- **Sentiment Analysis** for relationship management.
- **Follow-up Management** to auto-schedule pending tasks.
- **Interaction History** timeline with robust filters.
- **PostgreSQL Persistence** for robust data integrity.
- **LangGraph Tool Calling** linking natural language to CRUD operations.

---

## Project Structure

```text
backend/
│
├── app/
│   ├── api/          # FastAPI Routers
│   ├── services/     # AI Agent & LangGraph logic
│   ├── models/       # SQLAlchemy Database Models
│   ├── crud/         # Database operations
│   ├── db/           # Connection configurations
│   └── main.py       # FastAPI Entrypoint
│
frontend/
│
├── src/
│   ├── components/   # Reusable UI widgets
│   ├── pages/        # Route views (Dashboard, History, etc.)
│   ├── features/     # Redux slices
│   └── App.jsx       # React Entrypoint
```

---

## The LangGraph AI Agent & Workflow

### AI Workflow
```text
User Message
      ↓
FastAPI Endpoint
      ↓
LangGraph Agent
      ↓
Tool Selection
      ↓
LLM Structured Output (JSON)
      ↓
Database Operation (SQLAlchemy)
      ↓
Response Returned to React UI
```

### Agent Tools (The 5 Core Tools)
The LangGraph agent acts as an autonomous administrative assistant. It is equipped with five distinct Python tools mapped directly to PostgreSQL database operations:

1. **Log Interaction (Mandatory):** Captures interaction data from conversational notes. The LLM extracts the doctor's name, determines the sentiment, extracts medical entities, formulates a summary, and deduces action items before persisting to the DB.
2. **Edit Interaction (Mandatory):** Allows modification of previously logged data. The LLM re-evaluates the summary, sentiment, and entities based on updated context, and overwrites the DB record.
3. **Search Interaction:** A semantic retrieval tool. The rep can ask to "show meetings with Dr. Chen," translating natural language into a filtered SQL query.
4. **Summarize Interaction:** An analytical tool that retrieves the last N interactions for a doctor and synthesizes bullet points and an overall relationship sentiment score.
5. **Schedule Follow-up:** Extracts dates and tasks from the chat to create pending reminders linked to specific doctors.

---

## API Endpoints

**HCPs:**
- `GET /api/hcps/` - Retrieve all doctors.
- `POST /api/hcps/` - Create a new doctor profile.

**Interactions:**
- `GET /api/interactions/` - Retrieve all historical interactions.
- `POST /api/interactions/` - Log a new interaction.
- `PUT /api/interactions/{id}` - Update a specific interaction.
- `DELETE /api/interactions/{id}` - Delete an interaction.

**Follow-ups:**
- `GET /api/follow-ups/` - Fetch all tasks.
- `POST /api/follow-ups/` - Create a new task.
- `PUT /api/follow-ups/{id}` - Update task status.
- `DELETE /api/follow-ups/{id}` - Delete a task.

**AI Copilot:**
- `POST /api/chat/` - Invoke the LangGraph agent.

---

## LLM Selection

The original assignment requested the use of `gemma2-9b-it`. However, during implementation, Groq officially deprecated and removed this model from their API. 

To maintain compatibility while satisfying the strict assignment requirements (specifically the need for reliable structured JSON output), this project uses: **`llama-3.3-70b-versatile`**. This model provides elite structured output support and integrates flawlessly with LangGraph tool-calling functionality.

---

## Project Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### 1. Database Setup
Create a PostgreSQL database named `hcp_crm`:
```sql
CREATE DATABASE hcp_crm;
```

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

Create a `.env` file (do NOT commit this to GitHub):
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hcp_crm
GROQ_API_KEY=your_groq_api_key_here
```

Seed the database with mock data and start the server:
```bash
python seed.py
uvicorn app.main:app --reload
```

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

---

## Screenshots
*(Upload your screenshots to your GitHub repository and place the links here before submitting!)*
- [Dashboard]()
- [Log Interaction]()
- [History]()
- [Follow-ups]()
- [AI Copilot]()

---

## Future Improvements
- JWT Authentication
- Role-Based Access
- Docker Deployment
- Notification System
- Calendar & Email Integration
- Analytics Dashboard

---

## Author
**Athiya Tabassum**  
MCA Graduate  
*AI-First CRM HCP Module - Technical Assessment Submission*
