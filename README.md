# AI-First CRM HCP Module

## Project Overview
This project is an AI-powered Customer Relationship Management (CRM) system designed for Healthcare Professionals (HCPs). It enables pharmaceutical field representatives to manage doctor interactions through both a traditional form-based interface and an AI-powered conversational assistant.

The application combines React, FastAPI, PostgreSQL, LangGraph, and Groq LLM to automate interaction logging, generate summaries, extract medical entities, analyze sentiment, and schedule follow-up tasks.

---

## System Architecture

```text
Frontend (React + Redux)
      |
      | Axios API Calls
      ▼
Backend (FastAPI)
      |
LangGraph Agent
      |
      ├── Log Interaction
      ├── Edit Interaction
      ├── Search Interaction
      ├── Summarize Interaction
      └── Schedule Follow-up
      |
      ▼
PostgreSQL Database
```

---

## LangGraph Flow

The LangGraph agent acts as an autonomous administrative assistant. It is equipped with five distinct Python tools mapped directly to PostgreSQL database operations:

1. **Log Interaction:** Captures interaction data from conversational notes. The LLM extracts the doctor's name, determines the sentiment, extracts medical entities, formulates a summary, and deduces action items before persisting to the DB.
2. **Edit Interaction:** Allows modification of previously logged data. The LLM re-evaluates the summary, sentiment, and entities based on updated context, and overwrites the DB record.
3. **Search Interaction:** A semantic retrieval tool. The rep can ask to "show meetings with Dr. Chen," translating natural language into a filtered SQL query.
4. **Summarize Interaction:** An analytical tool that retrieves the last N interactions for a doctor and synthesizes bullet points and an overall relationship sentiment score.
5. **Schedule Follow-up:** Extracts dates and tasks from the chat to create pending reminders linked to specific doctors.

---

## Folder Structure

```text
AI_First_CRM_HCP/
│
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routers (Endpoints)
│   │   ├── services/     # AI Agent & LangGraph logic
│   │   ├── models/       # SQLAlchemy Database Models
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── crud/         # Database CRUD operations
│   │   ├── db/           # Connection configurations
│   │   └── main.py       # FastAPI Entrypoint
│   └── .env              # Backend Environment Variables
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI widgets
│   │   ├── pages/        # Route views (Dashboard, LogInteraction, etc.)
│   │   ├── features/     # Redux slices (State management)
│   │   ├── api/          # Axios configurations
│   │   └── App.jsx       # React Entrypoint
│   └── package.json      # Frontend dependencies
│
└── README.md
```

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

## Features & Screenshots

### 1. Interactive Dashboard
Provides a high-level overview of key metrics, pending follow-ups, and AI-generated insights. The dashboard dynamically updates greetings based on your local time and features smart Copilot suggestions for immediate action.

*(Please save your Dashboard screenshot as `dashboard.png` inside the `screenshots` folder to display it here)*
![Dashboard](./screenshots/dashboard.png)

### 2. Log Interaction (Structured Form)
A clean, intuitive form allowing field representatives to manually log meeting details, select a Healthcare Professional, and record notes.

*(Please save your Structured Form screenshot as `log_interaction.png` inside the `screenshots` folder to display it here)*
![Log Interaction Form](./screenshots/log_interaction.png)

### 3. AI CRM Copilot (Chat Interface)
An integrated LangGraph-powered chat assistant that slides out to help users log interactions, summarize past meetings, search history, and schedule follow-ups using natural language.

*(Please save your Copilot Chat screenshot as `copilot_chat.png` inside the `screenshots` folder to display it here)*
![AI Copilot](./screenshots/copilot_chat.png)

### 4. Interaction History
A comprehensive timeline view of all past engagements. Users can filter by doctor or meeting type and review AI-analyzed summaries for every logged interaction.

*(Please save your History screenshot as `history.png` inside the `screenshots` folder to display it here)*
![Interaction History](./screenshots/history.png)

---

## Installation

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
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# PostgreSQL Database URL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hcp_crm

# Groq API Key for LangGraph Agent
GROQ_API_KEY=your_groq_api_key_here

# Optional Configurations
APP_ENV=development
```

*(Do not commit this file to GitHub!)*

---

## Future Scope

- JWT Authentication for secure representative login.
- Role-Based Access Control (Admin vs. Field Rep).
- Docker Deployment (Dockerize frontend and backend).
- Email integration to automatically send the generated follow-ups.
- Advanced Analytics Dashboard.

---

## Author
**Athiya Tabassum**  
MCA Graduate  
*AI-First CRM HCP Module - Technical Assessment Submission*
