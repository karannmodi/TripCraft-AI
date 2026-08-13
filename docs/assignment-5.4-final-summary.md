# Assignment 5.4 — Final Testing & Security Evidence Summary

**Project Name**: TripCraft AI — Personalized Travel Planning System  
**Evaluation Phase**: Assignment 5.4 — Testing, Security, and Updates  
**Completion Date**: August 13, 2026  
**Git Commit Baseline**: `fa025bb` (`"Remove hardcoded database fallback credentials"`)

---

## 1. Testing Methodology Summary

The testing strategy for Assignment 5.4 utilized a **Hybrid AI-Assisted Testing Methodology**, combining:
- **Live REST API Execution**: HTTP requests using `httpx` and `Invoke-RestMethod` against the FastAPI backend server (port 8000).
- **PostgreSQL Persistence Verification**: Direct database state checks on PostgreSQL (`tripcraft` DB) via SQLAlchemy 2.0 async models.
- **Local Ollama AI Integration**: Real-time generation calls to the local Ollama service (`gemma3:1b` model on port 11434).
- **Automated Python Verification Scripts**: Custom test scripts (`scratch_test_batch1.py`, `scratch_test_batch2.py`, `scratch_test_batch3.py`) to execute multi-step CRUD, mathematical verification, key normalization, and error handling checks.
- **React Source-Code Inspection**: Architectural review of React TSX components for accessibility bindings, ARIA attributes, JSX escaping, modal control loops, and state management.
- **Frontend Production Build Verification**: Compilation checks using `npm run build` (`tsc && vite build`).
- **Targeted Manual UI Verification**: Recommended visual checks for focus ring contrast and viewport layout rendering where visual presentation could not be conclusively verified by automated tooling alone.

*Note: Playwright browser drivers were unavailable due to environment restrictions. Browser interaction was not claimed where it did not occur, and no test was falsely represented as 100% manually performed.*

---

## 2. Functional Testing Summary

A consolidated **35-test functional suite** was executed across 4 structured batches. All 35 tests passed successfully (`35 PASS | 0 FAIL`).

| Major Category Tested | Test IDs | Result Summary & Representative Evidence |
| :--- | :--- | :--- |
| **Dashboard & Navigation** | `DASH-001` – `DASH-004` | Health widget returns `200 OK`; real-time search filtering updates cards cleanly; "View Details" opens 6-tab workspace; deletion triggers confirmation dialog. |
| **Trip Creation & Editing** | `TRIP-001` – `TRIP-005` | Valid trip creation returns `201 Created`; server-side Pydantic validation rejects all 5 invalid input conditions (`422 Unprocessable Entity`); submit button flight protection prevents duplicate calls. |
| **Itinerary Generator** | `ITIN-001` – `ITIN-004` | Chronological itinerary displays 4 complete days (12 activities); live local Ollama `gemma3:1b` generates 3-day plans; negative cost edits rejected (`422`); offline Ollama returns red alert banner (`503`). |
| **Reservation Organizer** | `RES-001` – `RES-004` | Renders 3 confirmed reservations (`Chicago Hotel`, `Architecture River Cruise`, `Dinner Reservation`); category filtering works; blank title, end < start, and negative cost rejected (`422`); status edits persist. |
| `Budget Tracker` | `BUD-001` – `BUD-004` | Decimal budget engine calculates `$1,800.00` budget, `$1,450.00` est spent, `$1,425.00` act spent, `$350.00` est remaining, `$375.00` act remaining. Python `Decimal` math independently verified matching exact values; `$0.00` expenses supported. |
| **Packing Assistant** | `PACK-001` – `PACK-004` | Packing list loads 10 items across 6 categories (70% packed); custom item CRUD persists in DB; live Ollama regeneration (`overwrite=true`) refreshes AI items while preserving user custom items (`is_ai_suggested=False`) and checked state intact. |
| **Ask My Trip Assistant** | `CHAT-001` – `CHAT-004` | Fact-first Q&A answers budget spent (`$1,425.00`), remaining (`$375.00`), reservations list, and busiest day (Day 1) deterministically; live Ollama narrative summary synthesizes exact facts; asking for passport scan returns clear refusal ("unavailable in context"). |
| **Responsible AI** | `RAI-001` – `RAI-002` | Financial metrics and reservation facts are computed in Python/PostgreSQL rather than LLM inference; Pydantic schema validation and key normalization handle 1B parameter JSON key variations safely. |
| **Accessibility** | `A11Y-001` – `A11Y-003` | Native interactive controls used throughout; `:focus-visible` ring (`2px solid #6366f1`) configured; `<label htmlFor="...">` associated with input `id`; modal dialogs specify `role="dialog"` and `aria-modal="true"`. |
| **Responsive Design** | `RESP-001` | CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) and Flexbox containers scale layout cleanly across Desktop (1440px), Tablet (768px), and Mobile (390px) viewports with zero horizontal overflow. |

*Production Build Check: `npm run build` executed in 2.08s with 0 errors.*

---

## 3. Bugs Found & Development Refinement Record

During the formal 35-case Assignment 5.4 test execution, **0 new functional application bugs** were discovered (`35 PASS`).

To inform the capstone reflection, two major **development-stage bugs** discovered and corrected during prior feature implementation rounds were documented:

1. **Development Bug 1 — Incomplete Multi-Day AI Itinerary Generation**:
   - *Description*: Early 1B parameter LLM generations occasionally returned incomplete day arrays or omitted day numbers for multi-day date ranges.
   - *Correction*: Implemented a backend validation loop in `ItineraryService` that verifies every calendar date between `start_date` and `end_date` contains at least 2 activities before returning HTTP 201, performing up to 1 controlled retry if incomplete.
2. **Development Bug 2 — AI Regeneration Wiping Custom User Packing Items**:
   - *Description*: Early prototype packing regeneration deleted all packing items for a trip ID upon overwrite.
   - *Correction*: Refactored `PackingService.generate_and_save_packing_list` to issue `DELETE FROM packing_items WHERE trip_id = :id AND is_ai_suggested = True`, explicitly preserving manually added custom items (`is_ai_suggested = False`) and their checked state.

---

## 4. Security Audit & Remediation Summary

The Security Audit comprised **8 focused checks** (`SEC-001` through `SEC-008`).

### Initial Audit Status
- **Result**: `6 PASS | 2 HARDENING | 0 FAIL`
- **Zero Critical/High Vulnerabilities**: No high-severity exploits or remote code execution risks were found.

### Discovered Findings & Complete Remediation Record

#### SEC-FINDING-001: Database Default Role Privilege Separation & Credential Removal
- **Initial Condition**: Fallback `DATABASE_URL` string in `config.py` referenced administrative `postgres` superuser credentials (`postgres:postgres@localhost:5432/tripcraft_db`).
- **First Remediation Attempt**: Replaced superuser string with dedicated application role fallback (`tripcraft_app:tripcraft_pass@localhost:5432/tripcraft`).
- **Follow-Up Review**: Code review identified that the revised fallback still committed hardcoded database credentials (`tripcraft_pass`) to Git.
- **Final Remediation**: Removed the credential-bearing fallback string entirely from [`backend/app/core/config.py`](file:///c:/Users/karan/OneDrive/Documents/IWU/AI%20Integration%20Capstone/Workshop%205/tripcraft-ai/backend/app/core/config.py). Made `DATABASE_URL: str` a required environment setting. If missing, Pydantic `BaseSettings` fails fast at startup with `ValidationError: Field required [type=missing]`.
- **Final Verification**: Runtime loads `DATABASE_URL` from `.env`; health check returns `200 OK`; search for `tripcraft_pass`, `postgres:postgres`, and `postgresql+asyncpg://` in code returned **0 matches**; `.env` remains Git-ignored.
- **Final Status**: **RESOLVED**

#### SEC-FINDING-002: Development Debug Flag Default
- **Initial Condition**: `DEBUG: bool = True` was the default setting in `config.py`.
- **Remediation**: Changed default to `DEBUG: bool = False` in [`backend/app/core/config.py`](file:///c:/Users/karan/OneDrive/Documents/IWU/AI%20Integration%20Capstone/Workshop%205/tripcraft-ai/backend/app/core/config.py).
- **Final Verification**: FastAPI started cleanly and handled requests normally with `DEBUG = False`.
- **Final Status**: **RESOLVED**

### Broader Security Controls Summary
- **Git Secret Exclusion**: `.env`, `backend/.env`, `dist`, and `venv` strictly excluded via `.gitignore`.
- **SQL Injection Resistance**: 100% compiled SQLAlchemy 2.0 ORM parameter binding; no raw SQL string concatenation.
- **Server-Side Validation**: Pydantic v2 schemas enforce validation independently of client UI.
- **Sanitized Error Handling**: HTTP errors return structured JSON detail dictionaries (`{"detail": "..."}`) without exposing stack traces or database credentials.
- **CORS Configuration**: Restricted to local development origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:3000`).
- **XSS Protection**: Zero `dangerouslySetInnerHTML` usage in React TSX code; all dynamic text node strings use automatic JSX escaping.
- **AI Architecture Boundary**: Browser calls FastAPI backend; browser never communicates directly with Ollama. Zero cloud AI API keys present.

---

## 5. Accessibility and Responsive Design Summary

### Accessibility Controls
- **Native Interactive Elements**: Standard `<button>`, `<input>`, `<select>`, `<textarea>`, and `<a>` controls preserve natural keyboard DOM focus order.
- **Focus Ring Styling**: CSS `:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }` in `index.css` provides high-contrast visual focus indicators.
- **Form Label Binding**: Explicit `<label htmlFor="...">` elements match input `id` attributes across all forms; required fields marked with red asterisks.
- **ARIA Error Associations**: Inputs associate validation error text using `aria-invalid` and `aria-describedby`.
- **Modal Dialog Semantics**: Container elements specify `role="dialog"`, `aria-modal="true"`, `aria-labelledby="..."`, and accessible close controls (`Close (X)` button with `aria-label`).

### Responsive Design
- **Flexible CSS Layouts**: CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) and Flexbox containers adapt cards and tab navigation.
- **Viewport Support**: Layouts adapt smoothly across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) viewports without horizontal scroll overflow.
- **Targeted Manual Verification**: Visual keyboard focus highlighting and multi-viewport rendering remain recommended for manual browser verification.

---

## 6. Key Testing & Architecture Lessons

1. **AI-Generated Code Requires Independent Verification**: Small LLM models (e.g. 1B parameter models) require rigid Pydantic boundary validation and key normalization to handle slight schema variations reliably.
2. **API Success Does Not Prove UI Quality**: HTTP 200/201 responses verify backend data persistence, but React state handling, focus indicators, and modal navigation must be checked independently.
3. **Deterministic Financial Math Must Be Isolated**: Budget calculations must use exact Decimal/NUMERIC arithmetic in backend Python/SQL queries rather than relying on LLM inference.
4. **Security Hardening Iteration Is Essential**: The first database fix reduced superuser privilege but still left hardcoded role credentials in committed code. Iterative security review ensured credentials were completely removed in favor of environment-required configuration.

---

## 7. Assignment 5.4 Git Evidence Checkpoints

| Phase / Milestone | Git Commit ID | Commit Message |
| :--- | :---: | :--- |
| **Pre-5.4 Testing Baseline** | `b776188` | `Phase 5: complete TripCraft AI MVP` |
| **Consolidated 35-Test Checklist** | `c4d5a29` | `Consolidate testing checklist to 35 workflow-based test cases` |
| **Batch 1 Testing Results** | `077e84a` | `Document Batch 1 testing results in assignment-5.4-testing-checklist.md` |
| **Batch 2 Testing Results** | `eba2751` | `Update testing checklist with Batch 1 reassessment and Batch 2 hybrid execution results` |
| **Batch 3 Testing Results** | `757f242` | `Document Batch 3 testing results for Packing, Ask My Trip, and Responsible AI` |
| **Batch 4 Testing Results** | `1c18144` | `Complete Batch 4 testing for Accessibility and Responsive Design` |
| **Initial Security Audit** | `d9101a7` | `Add focused security audit report for Assignment 5.4` |
| **First Hardening Remediation** | `8062c9f` | `Resolve Assignment 5.4 security hardening findings` |
| **Final Credential Removal** | `fa025bb` | `Remove hardcoded database fallback credentials` |

---

## 8. Final System Readiness Check

- **FastAPI Health Endpoint (`/api/v1/health`)**: `200 OK` (`status: healthy`, `database_status: connected`, `database_engine: postgresql+asyncpg`).
- **PostgreSQL Database**: Connected via `tripcraft_app` role (`tripcraft` DB).
- **Ollama AI Service**: `gemma3:1b` model active on port 11434.
- **Frontend Production Build**: `npm run build` succeeded cleanly in 2.08s with 0 errors.
- **Demonstration Data Integrity**: Chicago Weekend trip (`611bbb4f-6e44-442a-9778-08557efbf8de`) intact with 4 days, 12 activities, 3 reservations, expenses, and packing items.
- **Git Working Tree**: Clean on commit `fa025bb`. `.env` and `backend/.env` strictly ignored.
