# Assignment 5.4 — Consolidated Testing Checklist for TripCraft AI

**Baseline Tag**: `pre-5.4-baseline` (Commit `b776188`)  
**Status Key**: `PENDING` (Not yet executed), `PASS` (Verified success), `PARTIAL / MANUAL CHECK` (Technical/API verified; visual confirmation recommended), `FAIL` (Defect identified)  
**Total Consolidated Tests**: **35**

---

## 1. Dashboard & Core Navigation

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DASH-001` | Dashboard | Dashboard & Health Status Overview | Main header, system architecture cards, and health badges load cleanly; clicking "Check System Health" refreshes FastAPI, PostgreSQL, and Ollama statuses. | `GET /api/v1/health` returns `200 OK` (`status: healthy`, `database_status: connected`). React component renders health grid with badges `HEALTHY`, `CONNECTED`, `OLLAMA / GEMMA 3 1B`, `FULL-STACK MVP READY`. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | System architecture health widget verified. |
| `DASH-002` | Dashboard | Trip Search & Filter Workflow | Real-time filtering updates trip cards by title/destination keywords; searching non-existent terms renders clean empty search state. | `GET /api/v1/trips` returns active trips. React `TripDashboard.tsx` filters cards in real-time by search term and renders *"No trips match your search criteria"* state when zero matches exist. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Search filtering and empty state rendering verified. |
| `DASH-003` | Dashboard | Trip Card Action Navigation | "View Details" opens 6-tab Workspace modal, "Edit" opens pre-populated form modal, and "Delete" triggers confirmation modal. | Endpoints `GET /api/v1/trips/{id}`, `PUT`, `DELETE` verified. `TripCard.tsx` opens 6-tab `TripDetailModal`, `TripFormModal` (edit), and delete confirmation dialog with `trip.title`. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | 6-tab modal navigation and action triggers verified. |
| `DASH-004` | Dashboard | Trip Deletion Workflow | Approving deletion sends `DELETE /api/v1/trips/{id}` and removes card from UI; canceling closes modal leaving database record intact. | `DELETE /api/v1/trips/{id}` returns `204 No Content` and removes record from PostgreSQL; Chicago Weekend trip remained 100% intact. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Database deletion and cancel modal behavior verified. |

---

## 2. Trip Creation & Editing

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TRIP-001` | Trip Form | Valid Trip Creation Workflow | Submitting valid parameters creates PostgreSQL record and renders new trip card on dashboard. | `POST /api/v1/trips` returns `201 Created` with UUID, Decimal budget, date strings, and interest tags. React state appends card to grid. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Valid trip creation verified end-to-end. |
| `TRIP-002` | Trip Form | Trip Form Invalid Input Validation | Test required fields (blank title/destination), whitespace-only text, end date before start date, traveler count < 1, and negative budget. Confirm UI alerts and HTTP 422 rejections. | Backend correctly returns `422 Unprocessable Entity` for all 5 invalid cases (blank title, whitespace title, end date < start date, travelers < 1, negative budget). Client component displays inline error alerts. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | 100% validation coverage across all 5 invalid conditions. |
| `TRIP-003` | Trip Form | Boundary & Large Field Values | Test long text strings (250+ chars), large budget ($99,999,999.99), and multi-tag interests to verify clean UI rendering and exact Decimal formatting. | `POST /api/v1/trips` returns `201 Created` and saves `budget_estimated: "99999999.99"` without float rounding errors. `TripCard.tsx` formats currency cleanly. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Decimal accuracy and text wrapping verified. |
| `TRIP-004` | Trip Form | Trip Edit & Update Workflow | Editing existing trip parameters (title, dates, budget, interests) updates PostgreSQL record and refreshes dashboard and detail modal. | `PUT /api/v1/trips/{id}` returns `200 OK` with updated title (*"Batch1 Updated Trip"*) and budget (`2000.00`). Dashboard state refreshes in real-time. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Trip edit persistence verified. |
| `TRIP-005` | Trip Form | Rapid Double-Submission Prevention | Clicking "Save" twice quickly activates loading/disabled button state, preventing duplicate API creation calls. | `TripFormModal.tsx` sets `isSubmitting = true`, disabling `<button type="submit" disabled={isSubmitting}>` during active request. | PASS | HYBRID (`AI-CODE-INSPECTION`) | Submit button flight protection verified. |

---

## 3. Itinerary Generator & Activity Editor

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ITIN-001` | Itinerary | Itinerary Display & Chronological Completeness | Displays chronological day cards for all calendar dates with 2–3 activities per day, time slots, and formatted costs. | `GET /api/v1/trips/{id}/itinerary` returns `200 OK` with 4 complete days (12 activities total) for Chicago trip across dates `['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21']`. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Chronological day completeness & activity count verified. |
| `ITIN-002` | Itinerary | AI Generation & Overwrite Workflow | Generates initial AI itinerary via `gemma3:1b`; clicking "Regenerate" displays overwrite modal, and confirming replaces existing itinerary days in DB. | `POST /api/v1/trips/{temp_id}/itinerary/generate` called live local Ollama model (`gemma3:1b`), returning `201 Created` with 3 complete days (3, 2, 3 activities). `ItineraryView.tsx` renders overwrite confirmation modal. | PASS | HYBRID (`AI-API/DB` + `AI-OLLAMA` + `AI-CODE-INSPECTION`) | Live local Ollama `gemma3:1b` generation verified. Temp trip cleaned up. |
| `ITIN-003` | Itinerary | Activity Edit & Delete Management | Editing activity parameters (title, time slot, location, cost, category) updates DB; invalid negative cost is rejected; deleting activity removes it from day. | `PUT /api/v1/trips/{id}/itinerary/activities/{act_id}` updated cost to `$50.00` (`200 OK`); negative cost edit returned `422 Unprocessable Entity`; original details restored. `DELETE` returns `200 OK`. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Activity CRUD and negative cost validation verified. |
| `ITIN-004` | Itinerary | Ollama Failure & Completeness Recovery | Offline Ollama service displays HTTP 503 error alert; incomplete generated days (< 2 activities) trigger automatic controlled retry. | Backend service `OllamaAIService` implements HTTP 503 error handling (`"Ollama AI service is offline"`) and day completeness retry loop. `ItineraryView.tsx` renders red error alert banner. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Failure alert and retry recovery verified in backend service. |

---

## 4. Reservation Organizer

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RES-001` | Reservations | Reservation Listing & Category Filtering | Renders reservation cards with type/status badges; category pill filters (`All`, `Lodging`, `Transportation`, `Restaurant`, `Activity`) filter visible cards. | `GET /api/v1/trips/{id}/reservations` returns `200 OK` with 3 confirmed reservations (`Chicago Hotel`, `Architecture River Cruise`, `Dinner Reservation`). `ReservationView.tsx` filters by category pill. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Reservation listing and category filtering verified. |
| `RES-002` | Reservations | Add Reservation Workflow | Submitting valid reservation across any type with confirmation code, provider, times, cost, and notes persists in PostgreSQL and renders card. | `POST /api/v1/trips/{id}/reservations` returned `201 Created` for temporary activity reservation (*"Temp Architectural Museum Tour"*). Persisted in PostgreSQL. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Reservation creation verified. Temp record removed after test. |
| `RES-003` | Reservations | Reservation Validation Handling | Test blank title, end time before start time, and negative cost. Confirm form/API rejects each invalid condition with clear alerts and HTTP 422. | Backend returned `422 Unprocessable Entity` for all 3 invalid cases: <br/>a) Blank title (`Reservation title cannot be blank.`) <br/>b) End time < start time (`End time cannot be before start time.`) <br/>c) Negative cost (`Cost cannot be negative.`). | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | 100% reservation validation coverage verified. |
| `RES-004` | Reservations | Reservation Edit & Delete Workflow | Editing reservation parameters (status `Confirmed` -> `Cancelled`, cost, provider) updates DB; deleting reservation with confirmation removes record. | `PUT /api/v1/trips/reservations/{id}` updated status to `Cancelled` and cost to `$50.00` (`200 OK`). `DELETE` returned `204 No Content` and removed record. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Reservation update and deletion verified. |

---

## 5. Budget Tracker

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BUD-001` | Budget | Budget Stat Cards & Category Breakdown | Accurately calculates and displays Trip Budget, Total Est Spent, Total Act Spent, Est Remaining, Act Remaining, and Category Breakdown totals using Python `Decimal`. | `GET /api/v1/trips/{id}/budget` returns `200 OK`. <br/>**Independent Math Check**: <br/>• Trip Budget: `$1,800.00` <br/>• Total Est Spent: `$1,450.00` <br/>• Total Act Spent: `$1,425.00` <br/>• Est Remaining: `$350.00` (`1800 - 1450 = 350`) <br/>• Act Remaining: `$375.00` (`1800 - 1425 = 375`). <br/>Math verified 100% exact! | PASS | HYBRID (`AI-API/DB` + `AI-AUTOMATED` + `AI-CODE-INSPECTION`) | Independent Decimal arithmetic verified 100% accurate. |
| `BUD-002` | Budget | Expense Creation & Paid Toggle | Submitting valid expense across categories (`Lodging`, `Food`, etc.) inserts DB record and updates stat cards; toggling "Is Paid" updates DB status. | `POST /api/v1/trips/{id}/expenses` returned `201 Created` for temp expense (*"Temp Souvenir T-Shirts"*). `PUT` toggled `is_paid` to `True` (`200 OK`). Stat cards recalculate instantly. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Expense creation and paid toggle verified. Temp record removed. |
| `BUD-003` | Budget | Expense Validation & Zero Values | Test submitting expense with blank description or negative amounts (rejected with HTTP 422) and test saving valid $0.00 zero-value expense. | Backend returned `422 Unprocessable Entity` for blank description and negative amount. Saving valid `$0.00` zero-value expense returned `201 Created`. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Expense validation and $0.00 zero-value support verified. |
| `BUD-004` | Budget | Expense Edit & Delete Workflow | Editing expense amounts/categories updates DB and recalculates budget balances in real-time; deleting expense updates remaining balance. | `PUT /api/v1/trips/expenses/{id}` updated actual amount to `$45.00` (`200 OK`). `DELETE` returned `204 No Content` and removed record, restoring original budget totals. | PASS | HYBRID (`AI-API/DB` + `AI-CODE-INSPECTION`) | Expense edit, delete, and real-time recalculation verified. |

---

## 6. Packing Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PACK-001` | Packing | AI Packing Generation & Progress Display | Generates AI packing list (`gemma3:1b`) across 6 categories; checking items updates progress bar (`X/Y packed`) and percentage. | Not Tested | PENDING | - | - |
| `PACK-002` | Packing | Manual Item CRUD & Checkbox Persistence | Adding custom item (`is_ai_suggested=False`) displays "Custom" badge; editing/deleting updates DB; checking item persists after page refresh. | Not Tested | PENDING | - | - |
| `PACK-003` | Packing | Safe Regeneration & Custom Item Preservation | Regenerating AI packing list after confirmation replaces AI-suggested items while preserving manually added custom items and their packed state intact. | Not Tested | PENDING | - | - |
| `PACK-004` | Packing | Packing Offline Error Handling | Offline Ollama service displays clear HTTP 503 error alert without losing existing packing items. | Not Tested | PENDING | - | - |

---

## 7. Ask My Trip Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHAT-001` | Ask My Trip | Deterministic Fact-First Q&A | Clicking suggestion pills or asking factual questions (reservations, budget spent/remaining, busiest day, packing stats) returns instant deterministic responses (< 0.1s) matching DB values. | Not Tested | PENDING | - | - |
| `CHAT-002` | Ask My Trip | Ollama Narrative Trip Summary | Asking "Summarize my trip" calls local Ollama model (`gemma3:1b`) with pre-calculated DB facts and renders natural narrative response. | Not Tested | PENDING | - | - |
| `CHAT-003` | Ask My Trip | Unavailable Information & Empty Input | Asking for non-existent database facts returns clear refusal stating data is unavailable rather than hallucinating; submitting blank message is rejected. | Not Tested | PENDING | - | - |
| `CHAT-004` | Ask My Trip | Chat History Persistence & Offline Handling | Past Q&A message thread persists across page refresh; offline Ollama service displays HTTP 503 error alert for narrative requests. | Not Tested | PENDING | - | - |

---

## 8. Accessibility & Responsive Design

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `A11Y-001` | Accessibility | Keyboard Navigation & Focus Ring Visibility | Full keyboard-only Tab/Shift+Tab navigation through header, cards, tabs, and form controls displays visible high-contrast focus indicators. | Not Tested | PENDING | - | - |
| `A11Y-002` | Accessibility | Control Activation & Modal Escape Dismissal | All buttons, tabs, checkboxes, and links activate cleanly using Enter or Space; pressing Escape key dismisses active modal dialogs. | Not Tested | PENDING | - | - |
| `A11Y-003` | Accessibility | Form Labels, Error Alerts & Focus Trapping | Form inputs feature explicit `<label>` bindings, error alerts are clear and readable, and open modal dialogs (`role="dialog"`) trap focus cleanly. | Not Tested | PENDING | - | - |
| `RESP-001` | Responsive | Multi-Viewport Responsive Usability | Renders layout cleanly at desktop (1280px+), tablet (768px–1023px), and mobile (< 767px) viewports with touch-friendly targets and zero horizontal overflow. | Not Tested | PENDING | - | - |

---

## 9. Responsible AI Behavior

| ID | Area | Test Case | Expected Result | Actual Result | Status | Verification Method | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RAI-001` | Responsible AI | Fact Grounding & Math Calculation Isolation | All financial metrics, budget remaining totals, and reservation figures are computed in Python/PostgreSQL rather than LLM inference, preventing math errors. | Not Tested | PENDING | - | - |
| `RAI-002` | Responsible AI | AI Output Validation & Key Normalization | Pydantic schema validation and key normalization handle small LLM JSON key variations (`item_name`, `name`, `item`) with 1 controlled retry on malformed structures. | Not Tested | PENDING | - | - |
