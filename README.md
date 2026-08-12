# TripCraft AI — Personalized Travel Planning System

TripCraft AI is an AI-assisted personal travel planning application built for individual travelers, developed as part of a graduate AI Integration Capstone project (Assignment 5.3).

---

## Key Features

1. **Trip Management**: Full CRUD operations for creating, viewing, editing, and deleting trip plans with destination, date ranges, traveler counts, estimated budget, pace, and preferences.
2. **AI Day-by-Day Itinerary Generation**: Uses local Ollama AI (`gemma3:1b`) to generate personalized itineraries containing 2–3 daily activities strictly bound to calendar dates without empty days or out-of-range dates.
3. **Reservation Organizer**: Tracks `Lodging`, `Transportation`, `Restaurant`, and `Activity` reservations with confirmation codes, start/end dates, costs, status (`Confirmed`, `Pending`, `Cancelled`), and notes.
4. **Budget Tracker**: Performs exact currency arithmetic using Python `Decimal` and PostgreSQL `NUMERIC(10,2)` (no LLM math errors). Displays overall budget, total estimated spending, total actual spending, remaining budget, and category breakdowns.
5. **AI Packing Assistant**: Generates structured packing checklists grouped into 6 categories (`Clothing`, `Documents`, `Electronics`, `Toiletries`, `Activity-specific items`, `Miscellaneous`). Supports interactive checkbox toggles, manual custom item CRUD, and safe regeneration that preserves user-added custom items.
6. **Fact-First Ask My Trip Assistant**: Answers travel questions using database facts retrieved directly from PostgreSQL FIRST to eliminate LLM hallucination for deterministic queries (budget spent/remaining, reservations list, busiest day, packing stats), while calling local Ollama (`gemma3:1b`) for natural narrative trip summaries.

---

## Architecture Summary

```text
+-----------------------------------------------------------------------+
|                         TripCraft AI System                           |
|                                                                       |
|  React 18 / Vite / TypeScript UI  (Port 5173 or Port 8000 Static)     |
|    └─ 6 Sub-Navigation Tabs: Details, Itinerary, Reservations,       |
|       Budget Tracker, Packing, Ask My Trip                            |
|                                 │                                     |
|                                 ▼ REST API (HTTP / JSON)              |
|  FastAPI Backend Server (Port 8000)                                   |
|    ├─ SQLAlchemy 2.0 Async / Pydantic v2 Validation                  |
|    ├─ Exact Decimal Budget Engine (No AI Math)                        |
|    └─ Fact-First Q&A Intent Router                                    |
|            │                                  │                       |
|            ▼ SQL                              ▼ HTTP JSON             |
|  PostgreSQL Database              Local Ollama AI Server (Port 11434) |
|    (NUMERIC 10,2 Currency)           (gemma3:1b model)                |
+-----------------------------------------------------------------------+
```

---

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.0 or higher
- **PostgreSQL**: 14.0 or higher running locally (Port 5432)
- **Ollama**: Installed locally with `gemma3:1b` model pulled

---

## Environment Variable Setup

Create `backend/.env` based on placeholders (never commit actual secrets):

```env
APP_NAME=TripCraft AI
ENVIRONMENT=development
LOG_LEVEL=INFO

# Database Connection Placeholders
POSTGRES_USER=tripcraft_app
POSTGRES_PASSWORD=your_secure_db_password_here
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=tripcraft

# Local Ollama AI Integration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b
```

---

## Database Setup

1. Start local PostgreSQL service.
2. Run database setup script (or create role `tripcraft_app` and database `tripcraft` manually):

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/setup_db.ps1
```

---

## Local Ollama AI Setup

1. Confirm Ollama is running locally:
   ```powershell
   ollama --version
   ```
2. Pull the required 1B parameter model:
   ```powershell
   ollama pull gemma3:1b
   ```
3. Confirm model is installed:
   ```powershell
   ollama list
   ```

---

## Application Startup Commands

### 1. Backend Startup (FastAPI)

From the `backend/` directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend health endpoint: `http://localhost:8000/api/v1/health`

### 2. Frontend Startup (React / Vite)

From the `frontend/` directory:

```powershell
cd frontend
npm install
npm run dev
```

Frontend development server: `http://localhost:5173`

---

## Normal Localhost URLs

- **React Dev UI**: `http://localhost:5173`
- **FastAPI API & Static Serving**: `http://localhost:8000`
- **Backend Health Check**: `http://localhost:8000/api/v1/health`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Local Ollama API**: `http://localhost:11434`

---

## Troubleshooting Notes

- **Ollama Offline**: If Ask My Trip narrative or Packing generation fails with HTTP 503, verify Ollama service is running using `ollama list` or `curl http://localhost:11434`.
- **Database Connection Error**: Verify PostgreSQL service is started on port 5432 and credentials in `backend/.env` match your local PostgreSQL role.
- **Frontend Production Serving**: Running `npm run build` in `frontend/` builds static assets to `frontend/dist`. FastAPI serves `frontend/dist` directly at `http://localhost:8000`.
