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

### Entry 3: Phase 2 — Trip Creation & Dashboard
- **Date/Time**: 2026-08-11
- **Stage**: Phase 2 — Trip Creation & Dashboard
- **Prompts / Directives**:
  - Implement full-stack Trip CRUD operations (`POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`) using React 18 $\rightarrow$ FastAPI $\rightarrow$ PostgreSQL architecture.
  - Enforce field validation: title/destination non-blank, `end_date` $\ge$ `start_date`, travelers $\ge 1$, budget $\ge 0$, and non-existent IDs returning 404.
  - Preserve exact Decimal precision across API contract via consistent string serialization/parsing between FastAPI and TypeScript.
  - Build responsive, accessible React Trip Dashboard with search/filter, loading states, success/error toasts, detail view modal, and delete confirmation dialog.
  - Create and persist realistic test trip ("Chicago Weekend", Sept 18–21, 2026, 2 travelers, $1,800.00 budget) via FastAPI API.
  - Maintain clean 6-layer architecture and omit AI, itinerary generation, reservations, expenses, packing, chat, auth, Docker, or AWS work.
- **Changes Implemented**:
  - **Backend**:
    - Created `backend/app/services/trip_service.py` implementing async SQLAlchemy 2.0 CRUD methods.
    - Created `backend/app/api/v1/trips.py` router with endpoints for `POST`, `GET`, `GET /{id}`, `PUT /{id}`, and `DELETE /{id}` with strict HTTP status codes (`201`, `200`, `204`, `404`, `422`).
    - Updated `backend/app/schemas/trip.py` with `@field_validator` and `@model_validator` for date range and non-blank title/destination, and `@field_serializer` for exact string Decimal serialization (`"1800.00"`).
    - Updated `backend/app/api/v1/router.py` to mount `/trips` router.
    - Updated `backend/app/main.py` SPA fallback handler to ensure API endpoints pass through to FastAPI handlers without method interception.
  - **Frontend**:
    - Updated `frontend/src/types/trip.ts` with `TripCreateInput`, `TripUpdateInput`, and string Decimal types.
    - Updated `frontend/src/api/client.ts` with `fetchTrips`, `fetchTripById`, `createTrip`, `updateTrip`, and `deleteTrip` API wrappers.
    - Built accessible components: `TripCard.tsx`, `TripFormModal.tsx`, `TripDetailModal.tsx`, `DeleteConfirmModal.tsx`, and `TripDashboard.tsx`.
    - Integrated `TripDashboard` into `frontend/src/App.tsx`.
- **Challenges / Errors & Solutions**:
  - *Challenge*: Avoiding floating-point precision loss when transmitting Decimal monetary figures across FastAPI and TypeScript.
  - *Solution*: Configured Pydantic v2 `@field_serializer` to format `Decimal` as exact 2-decimal strings (`"1800.00"`) across HTTP responses and parsed input strings in TypeScript.
  - *Challenge*: SPA catch-all route intercepting `POST /api/v1/trips` with 405 Method Not Allowed when `frontend/dist` existed.
  - *Solution*: Updated SPA fallback route handler in `main.py` to raise 404 for `/api/*` routes, allowing FastAPI routing table to handle method matching.
- **Lessons Learned**:
  - Combining strict Pydantic model validation with string Decimal serialization guarantees financial data integrity without relying on binary floating-point representation in modern full-stack web applications.
- **Time Spent**: ~1.5 hours

### Entry 4: Phase 3 — Local AI Itinerary Generation (Ollama)
- **Date/Time**: 2026-08-11
- **Stage**: Phase 3 — Local AI Itinerary Generation (Ollama)
- **Prompts / Directives**:
  - Implement local AI integration using `gemma3:1b` via local Ollama service (`http://localhost:11434`, model path `D:\ollama\models`).
  - Enforce approved Phase 3 architecture: React $\rightarrow$ FastAPI $\rightarrow$ PostgreSQL $\rightarrow$ OllamaAIService $\rightarrow$ gemma3:1b $\rightarrow$ structured JSON $\rightarrow$ Pydantic validation $\rightarrow$ PostgreSQL $\rightarrow$ React.
  - Implement reliable day-by-day generation strategy: calculate all trip dates using application logic, prompt Ollama for each specific date, validate each day with Pydantic (`AIItineraryDay` with $\ge 2$ activities per day), allow 1 controlled retry per day, and perform strict application-level completeness checks across all required trip dates.
  - Enforce atomic database persistence: perform AI generation and completeness verification FIRST before mutating PostgreSQL, ensuring old itineraries are never overwritten by incomplete/failed generations.
  - Ensure clear HTTP 503 Service Unavailable error returned if Ollama is offline (no silent mock fallback).
  - Preserve exact Decimal currency handling (`Numeric(10,2)` in PostgreSQL & string Decimal serialization).
  - Implement full-stack itinerary features: generate AI itinerary, retrieve itinerary, day-by-day display, editable activities, activity deletion, regeneration with overwrite confirmation, and PostgreSQL persistence.
  - Use Chicago Weekend trip for final verification.
- **Changes Implemented**:
  - **Backend**:
    - Configured `OLLAMA_BASE_URL` and `OLLAMA_MODEL` in `config.py`, `.env`, and `.env.example`.
    - Updated `backend/app/services/ollama_service.py` with day-by-day generation (`generate_day_itinerary`), Pydantic validation (`AIItineraryDay` requiring `min_length=2` activities), 1 controlled retry per day, and application-level completeness checks (`_verify_completeness`).
    - Updated `backend/app/services/itinerary_service.py` to enforce safe atomic persistence (AI generation and validation complete 100% before deleting/inserting records in PostgreSQL).
    - Created `backend/app/api/v1/itinerary.py` with `GET /trips/{id}/itinerary`, `POST /trips/{id}/itinerary/generate`, `PUT /trips/{id}/itinerary/activities/{id}`, and `DELETE /trips/{id}/itinerary/activities/{id}` endpoints.
    - Updated `backend/app/schemas/itinerary.py` with `AIItineraryDay` (at least 2 activities required, resilient string/list note validators), `AIItineraryActivity` (non-negative cost validation), and cost serializers (`"25.00"`).
    - Mounted itinerary router into FastAPI `api_router` in `backend/app/api/v1/router.py`.
  - **Frontend**:
    - Updated `frontend/src/types/trip.ts` with `ItineraryDay`, `ItineraryActivity`, and `ItineraryActivityUpdateInput` interfaces.
    - Updated `frontend/src/api/client.ts` with `fetchItinerary`, `generateItinerary`, `updateActivity`, and `deleteActivity` API wrappers.
    - Created `ItineraryView.tsx` and `ActivityEditModal.tsx` React components for day-by-day display, loading state, error alert, overwrite confirmation modal, activity edit modal, and deletion.
    - Integrated `ItineraryView` into `TripDetailModal.tsx`.
- **Challenges / Errors & Solutions**:
  - *Challenge 1 (Ollama Installer / System Path & Storage)*: Ollama installer on Windows defaulted to user directory on C drive, but target model storage was specified as `D:\ollama\models`.
  - *Solution*: Configured system environment variable `OLLAMA_MODELS=D:\ollama\models`, ensured `ollama.exe` was on system `PATH`, verified local Ollama server running on port 11434, pulled `gemma3:1b` model (815MB), and confirmed blob storage in `D:\ollama\models\manifests` and `D:\ollama\models\blobs`.
  - *Challenge 2 (Multi-Day Generation Truncation on 1B Model)*: Asking `gemma3:1b` to generate a full 4-day itinerary in a single prompt led to incomplete output where Day 1 had activities while Days 2–4 were empty or truncated.
  - *Solution*: Refactored generation to calculate all required trip dates in FastAPI application logic and prompt Ollama for one day at a time. Each day request is fast, focused, validated against `AIItineraryDay` ($\ge 2$ activities), and retried once if malformed.
  - *Challenge 3 (Safe Transactional Persistence)*: Deleting old itinerary records before AI generation finishes risks leaving the database empty or partially populated if generation fails halfway.
  - *Solution*: Reordered service logic so all days are generated, validated, and checked for completeness FIRST. PostgreSQL deletion and insertion take place atomically inside a single commit transaction.
- **Lessons Learned**:
  - Decomposing multi-day LLM tasks into single-day structured prompts dramatically improves response quality and eliminates empty days for small 1B parameter models, while strict Pydantic validation combined with atomic DB persistence guarantees data completeness and database integrity.
- **Time Spent**: ~2.5 hours

### Entry 5: Phase 4 — Reservation Organizer & Budget Tracker
- **Date/Time**: 2026-08-11
- **Stage**: Phase 4 — Reservation Organizer & Budget Tracker (Assignment 5.3)
- **Prompts / Directives**:
  - Implement full-stack Reservation Organizer supporting `Lodging`, `Transportation`, `Restaurant`, `Activity` types with CRUD operations, status tracking, provider info, confirmation codes, datetime validation, and Decimal cost handling.
  - Implement full-stack Budget Tracker using traditional Python `Decimal` / PostgreSQL `NUMERIC(10,2)` application logic (no AI arithmetic).
  - Calculate overall trip budget, total estimated spending, total actual spending, estimated budget remaining, actual budget remaining, and category breakdowns.
  - Integrate tabbed sub-navigation in `TripDetailModal` (*Details*, *Itinerary*, *Reservations*, *Budget Tracker*) keeping existing dark glassmorphic styling.
  - Validate non-blank titles/descriptions, non-negative amounts, and date ordering (`end_time >= start_time`).
  - Populate demonstration records for Chicago Weekend:
    - Reservations: Chicago Hotel ($725.00), Architecture River Cruise ($75.00), Dinner Reservation ($120.00).
    - Expenses: Hotel (Est: $700.00, Act: $725.00), Transportation (Est: $150.00, Act: $135.00), Food (Est: $350.00, Act: $320.00), Activities (Est: $250.00, Act: $245.00).
  - Ensure frontend production build (`npm run build`) passes cleanly.
- **Changes Implemented**:
  - **Backend**:
    - Refined `backend/app/schemas/reservation.py` (`ReservationBase`, `ReservationCreate`, `ReservationUpdate`, `ReservationResponse`) with `min_length=1` non-blank title validator, non-negative cost validator, and `end_time >= start_time` model validator.
    - Refined `backend/app/schemas/budget.py` (`ExpenseBase`, `ExpenseCreate`, `ExpenseUpdate`, `ExpenseResponse`, `BudgetSummaryResponse`, `CategoryBudgetBreakdown`) with non-blank description validator, non-negative estimated/actual amount validators, and exact Decimal formatted serializers.
    - Created `backend/app/services/reservation_service.py` for database CRUD operations on `Reservation` model.
    - Created `backend/app/services/budget_service.py` for exact Decimal budget calculations and CRUD operations on `Expense` model.
    - Created `backend/app/api/v1/reservations.py` (`GET`, `POST`, `PUT`, `DELETE` endpoints under `/trips/{id}/reservations`).
    - Created `backend/app/api/v1/budget.py` (`GET /trips/{id}/budget` and `POST`, `PUT`, `DELETE` endpoints under `/trips/{id}/expenses`).
    - Mounted routers in `backend/app/api/v1/router.py`.
  - **Frontend**:
    - Updated `frontend/src/types/trip.ts` with `Reservation`, `Expense`, `BudgetSummary`, and input interfaces.
    - Updated `frontend/src/api/client.ts` with Reservation and Budget API wrapper functions.
    - Created `ReservationFormModal.tsx` for accessible reservation creation and editing with client-side error alerts.
    - Created `ReservationsView.tsx` with filter pills (`All`, `Lodging`, `Transportation`, `Restaurant`, `Activity`), status badges (`Confirmed`, `Pending`, `Cancelled`), cards layout, empty state, and delete modal.
    - Created `ExpenseFormModal.tsx` for accessible expense creation and editing.
    - Created `BudgetView.tsx` featuring 5 summary stat cards (**Trip Budget**, **Total Estimated Spending**, **Total Actual Spending**, **Estimated Budget Remaining**, **Actual Budget Remaining**), category breakdown table, expense table, and delete modal.
    - Updated `TripDetailModal.tsx` with top tabbed sub-navigation bar (*Details*, *Itinerary*, *Reservations*, *Budget Tracker*).
    - Updated `DeleteConfirmModal.tsx` to support optional custom titles and messages.
- **Challenges / Errors & Solutions**:
  - *Challenge 1 (Type Error on Missing Schema Import)*: Starting uvicorn triggered `NameError: name 'Any' is not defined` in `reservation.py`.
  - *Solution*: Added `Any` to `from typing import Optional, Any` in `backend/app/schemas/reservation.py`.
  - *Challenge 2 (TypeScript Build Errors)*: Running `npm run build` flagged unused Lucide icon imports and a typo in `justify: 'space-between'`.
  - *Solution*: Cleaned up unused imports in React components, replaced `justify` with `justifyContent`, and changed `WalletCard` to `Wallet` icon in `TripDetailModal.tsx`.
- **Lessons Learned**:
  - Performing financial calculations strictly in Python/FastAPI using `Decimal` completely eliminates floating-point rounding errors and LLM hallucination risks, while FastAPI Pydantic schema serializers guarantee exact `"700.00"` formatting across the REST interface.
- **Time Spent**: ~2.0 hours





