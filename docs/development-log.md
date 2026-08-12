# Academic Development Log - TripCraft AI

**Application**: TripCraft AI  
**Course**: Graduate AI Integration Capstone  
**Student Project**: Assignment 5.3 & Subsequent Workshop Modules  

---

## Log Entries

### Entry 1: Phase 1 — Project Foundation
- **Date/Time**: 2026-08-11
- **Stage**: Phase 1 — Project Foundation
- **Prompts / Directives**:
  - Establish full-stack React (Vite + TypeScript) and FastAPI backend workspace.
  - Implement PostgreSQL as primary database using SQLAlchemy 2.0 Async (`NUMERIC(10,2)` currency types for exact Decimal precision).
  - Configure environment-driven settings (`DATABASE_URL`, `VITE_API_BASE_URL`, CORS origins).
  - Architect FastAPI static file serving readiness for single-service AWS App Runner deployment.
  - Omit user authentication for MVP functionality.
  - Enforce clean 6-layer architecture & accessible UI primitives.
- **Changes Implemented**:
  - Initialized `docs/development-log.md` and `.env.example`.
  - Created backend architecture in `backend/app/` (`core/config.py`, `core/database.py`, SQLAlchemy async models with Decimal precision, Pydantic v2 schemas, `/health` endpoint).
  - Created frontend architecture in `frontend/` (Vite + React + TypeScript, `client.ts` API wrapper, semantic HTML layout, health probe verification UI).
- **Challenges / Errors & Solutions**:
  - *Challenge*: Avoiding floating-point precision loss on budget calculations.
  - *Solution*: Used PostgreSQL `NUMERIC(10, 2)` mapped to Python `Decimal` and TypeScript string/number representations.
  - *Challenge*: Preparing for single-service deployment without breaking Vite local HMR.
  - *Solution*: Used environment conditional static asset mounting in FastAPI (`/app` and `/` SPA fallback) while allowing `VITE_API_BASE_URL` to route requests to FastAPI port `8000` during dev.
- **Lessons Learned**:
  - Decoupling database configuration behind `DATABASE_URL` and isolating AI services behind abstract interfaces creates a clean, testable system that easily adapts to future deployment targets.
- **Time Spent**: ~1.5 hours

### Entry 2: Phase 1 — Runtime Verification
- **Date/Time**: 2026-08-11
- **Stage**: Phase 1 — Runtime Verification
- **Prompts / Directives**:
  - Perform read-only Phase 1 runtime checks on database, backend, and frontend without re-running initialization scripts or beginning Phase 2.
  - Verify PostgreSQL 18 service, port 5432 listening status, `tripcraft` database, and `tripcraft_app` role.
  - Confirm presence and git-ignore status of `.env` files.
  - Test application database connection using `SELECT 1`.
  - Start FastAPI server and test `/health` and `/api/v1/health` endpoints.
  - Start Vite dev server and test React &rarr; FastAPI health proxy connectivity.
- **Checks & Results**:
  - PostgreSQL 18 Service Running: **PASS** (`postgresql-x64-18` status: Running).
  - Port 5432 Listening: **PASS** (Listening on `0.0.0.0:5432` and `[::]:5432`).
  - `tripcraft` Database Exists: **PASS** (Confirmed in PostgreSQL).
  - `tripcraft_app` Role Exists: **PASS** (Confirmed in PostgreSQL).
  - Local `.env` Exists (Secrets Masked): **PASS** (Found in root & backend).
  - `.env` Git-Ignored: **PASS** (Verified with `git check-ignore`).
  - Database Connection `SELECT 1`: **PASS** (Query returned `1` via SQLAlchemy async engine).
  - FastAPI Server Start: **PASS** (Running on `http://127.0.0.1:8000`).
  - `/health` & `/api/v1/health` Endpoints: **PASS** (Both returned HTTP 200 `healthy`, `database_status: connected`).
  - Vite Frontend Start: **PASS** (Running on `http://localhost:5173`).
  - React &rarr; FastAPI Health Proxy: **PASS** (`http://localhost:5173/api/v1/health` returned `healthy` and `database_status: connected`).
  - Logs Inspection: **PASS** (Backend Uvicorn logs clean; Vite HMR/Proxy active).
- **Lessons Learned**:
  - Non-destructive read-only verification of existing database schemas and environment states prevents unnecessary data loss and confirms full-stack readiness before introducing complex feature development.
- **Time Spent**: ~0.5 hours

