# TripCraft AI

TripCraft AI is an AI-powered personal travel planning application for individual travelers, developed for a graduate AI Integration Capstone assignment.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS Design System with WCAG Accessibility
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2
- **Database**: PostgreSQL (via `asyncpg` with `NUMERIC(10,2)` Decimal precision)
- **Deployment Target**: AWS App Runner single-service hosting

---

## Initial Database Setup (One-Time)

To set up the local PostgreSQL role (`tripcraft_app`) and database (`tripcraft`) interactively:

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/setup_db.ps1
```
This script will prompt you for passwords locally and generate the local `.env` configuration file (which is ignored by Git).

---

## Local Development Setup

### 1. Backend Setup
From the `backend/` working directory:
```powershell
cd backend
py -3 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
py -3 -m app.main
```
Or from the project root directory (`tripcraft-ai`):
```powershell
$env:PYTHONPATH="backend"
py -3 -m backend.app.main
```
Backend will be available at `http://localhost:8000`. Health endpoint: `http://localhost:8000/health`.

### 2. Frontend Setup
From the project root directory:
```powershell
npm --prefix frontend run dev
```
Frontend will be available at `http://localhost:5173`.
