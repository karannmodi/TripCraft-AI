# Assignment 5.4 — Consolidated Testing Checklist for TripCraft AI

**Baseline Tag**: `pre-5.4-baseline` (Commit `b776188`)  
**Status Key**: `PENDING` (Not yet executed), `PASS` (Verified success), `FAIL` (Defect identified)  
**Total Consolidated Tests**: **35**

---

## 1. Dashboard & Core Navigation

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DASH-001` | Dashboard | Dashboard & Health Status Overview | Main header, system architecture cards, and health badges load cleanly; clicking "Check System Health" refreshes FastAPI, PostgreSQL, and Ollama statuses. | Not Tested | PENDING | - |
| `DASH-002` | Dashboard | Trip Search & Filter Workflow | Real-time filtering updates trip cards by title/destination keywords; searching non-existent terms renders clean empty search state. | Not Tested | PENDING | - |
| `DASH-003` | Dashboard | Trip Card Action Navigation | "View Details" opens 6-tab Workspace modal, "Edit" opens pre-populated form modal, and "Delete" triggers confirmation modal. | Not Tested | PENDING | - |
| `DASH-004` | Dashboard | Trip Deletion Workflow | Approving deletion sends `DELETE /api/v1/trips/{id}` and removes card from UI; canceling closes modal leaving database record intact. | Not Tested | PENDING | - |

---

## 2. Trip Creation & Editing

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TRIP-001` | Trip Form | Valid Trip Creation Workflow | Submitting valid parameters creates PostgreSQL record and renders new trip card on dashboard. | Not Tested | PENDING | - |
| `TRIP-002` | Trip Form | Trip Form Invalid Input Validation | Test required fields (blank title/destination), whitespace-only text, end date before start date, traveler count < 1, and negative budget. Confirm UI alerts and HTTP 422 rejections. | Not Tested | PENDING | - |
| `TRIP-003` | Trip Form | Boundary & Large Field Values | Test long text strings (250+ chars), large budget ($99,999,999.99), and multi-tag interests to verify clean UI rendering and exact Decimal formatting. | Not Tested | PENDING | - |
| `TRIP-004` | Trip Form | Trip Edit & Update Workflow | Editing existing trip parameters (title, dates, budget, interests) updates PostgreSQL record and refreshes dashboard and detail modal. | Not Tested | PENDING | - |
| `TRIP-005` | Trip Form | Rapid Double-Submission Prevention | Clicking "Save" twice quickly activates loading/disabled button state, preventing duplicate API creation calls. | Not Tested | PENDING | - |

---

## 3. Itinerary Generator & Activity Editor

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ITIN-001` | Itinerary | Itinerary Display & Chronological Completeness | Displays chronological day cards for all calendar dates with 2–3 activities per day, time slots, and formatted costs. | Not Tested | PENDING | - |
| `ITIN-002` | Itinerary | AI Generation & Overwrite Workflow | Generates initial AI itinerary via `gemma3:1b`; clicking "Regenerate" displays overwrite modal, and confirming replaces existing itinerary days in DB. | Not Tested | PENDING | - |
| `ITIN-003` | Itinerary | Activity Edit & Delete Management | Editing activity parameters (title, time slot, location, cost, category) updates DB; invalid negative cost is rejected; deleting activity removes it from day. | Not Tested | PENDING | - |
| `ITIN-004` | Itinerary | Ollama Failure & Completeness Recovery | Offline Ollama service displays HTTP 503 error alert; incomplete generated days (< 2 activities) trigger automatic controlled retry. | Not Tested | PENDING | - |

---

## 4. Reservation Organizer

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RES-001` | Reservations | Reservation Listing & Category Filtering | Renders reservation cards with type/status badges; category pill filters (`All`, `Lodging`, `Transportation`, `Restaurant`, `Activity`) filter visible cards. | Not Tested | PENDING | - |
| `RES-002` | Reservations | Add Reservation Workflow | Submitting valid reservation across any type with confirmation code, provider, times, cost, and notes persists in PostgreSQL and renders card. | Not Tested | PENDING | - |
| `RES-003` | Reservations | Reservation Validation Handling | Test blank title, end time before start time, and negative cost. Confirm form/API rejects each invalid condition with clear alerts and HTTP 422. | Not Tested | PENDING | - |
| `RES-004` | Reservations | Reservation Edit & Delete Workflow | Editing reservation parameters (status `Confirmed` -> `Cancelled`, cost, provider) updates DB; deleting reservation with confirmation removes record. | Not Tested | PENDING | - |

---

## 5. Budget Tracker

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BUD-001` | Budget | Budget Stat Cards & Category Breakdown | Accurately calculates and displays Trip Budget, Total Est Spent, Total Act Spent, Est Remaining, Act Remaining, and Category Breakdown totals using Python `Decimal`. | Not Tested | PENDING | - |
| `BUD-002` | Budget | Expense Creation & Paid Toggle | Submitting valid expense across categories (`Lodging`, `Food`, etc.) inserts DB record and updates stat cards; toggling "Is Paid" updates DB status. | Not Tested | PENDING | - |
| `BUD-003` | Budget | Expense Validation & Zero Values | Test submitting expense with blank description or negative amounts (rejected with HTTP 422) and test saving valid $0.00 zero-value expense. | Not Tested | PENDING | - |
| `BUD-004` | Budget | Expense Edit & Delete Workflow | Editing expense amounts/categories updates DB and recalculates budget balances in real-time; deleting expense updates remaining balance. | Not Tested | PENDING | - |

---

## 6. Packing Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PACK-001` | Packing | AI Packing Generation & Progress Display | Generates AI packing list (`gemma3:1b`) across 6 categories; checking items updates progress bar (`X/Y packed`) and percentage. | Not Tested | PENDING | - |
| `PACK-002` | Packing | Manual Item CRUD & Checkbox Persistence | Adding custom item (`is_ai_suggested=False`) displays "Custom" badge; editing/deleting updates DB; checking item persists after page refresh. | Not Tested | PENDING | - |
| `PACK-003` | Packing | Safe Regeneration & Custom Item Preservation | Regenerating AI packing list after confirmation replaces AI-suggested items while preserving manually added custom items and their packed state intact. | Not Tested | PENDING | - |
| `PACK-004` | Packing | Packing Offline Error Handling | Offline Ollama service displays clear HTTP 503 error alert without losing existing packing items. | Not Tested | PENDING | - |

---

## 7. Ask My Trip Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHAT-001` | Ask My Trip | Deterministic Fact-First Q&A | Clicking suggestion pills or asking factual questions (reservations, budget spent/remaining, busiest day, packing stats) returns instant deterministic responses (< 0.1s) matching DB values. | Not Tested | PENDING | - |
| `CHAT-002` | Ask My Trip | Ollama Narrative Trip Summary | Asking "Summarize my trip" calls local Ollama model (`gemma3:1b`) with pre-calculated DB facts and renders natural narrative response. | Not Tested | PENDING | - |
| `CHAT-003` | Ask My Trip | Unavailable Information & Empty Input | Asking for non-existent database facts returns clear refusal stating data is unavailable rather than hallucinating; submitting blank message is rejected. | Not Tested | PENDING | - |
| `CHAT-004` | Ask My Trip | Chat History Persistence & Offline Handling | Past Q&A message thread persists across page refresh; offline Ollama service displays HTTP 503 error alert for narrative requests. | Not Tested | PENDING | - |

---

## 8. Accessibility & Responsive Design

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `A11Y-001` | Accessibility | Keyboard Navigation & Focus Ring Visibility | Full keyboard-only Tab/Shift+Tab navigation through header, cards, tabs, and form controls displays visible high-contrast focus indicators. | Not Tested | PENDING | - |
| `A11Y-002` | Accessibility | Control Activation & Modal Escape Dismissal | All buttons, tabs, checkboxes, and links activate cleanly using Enter or Space; pressing Escape key dismisses active modal dialogs. | Not Tested | PENDING | - |
| `A11Y-003` | Accessibility | Form Labels, Error Alerts & Focus Trapping | Form inputs feature explicit `<label>` bindings, error alerts are clear and readable, and open modal dialogs (`role="dialog"`) trap focus cleanly. | Not Tested | PENDING | - |
| `RESP-001` | Responsive | Multi-Viewport Responsive Usability | Renders layout cleanly at desktop (1280px+), tablet (768px–1023px), and mobile (< 767px) viewports with touch-friendly targets and zero horizontal overflow. | Not Tested | PENDING | - |

---

## 9. Responsible AI Behavior

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RAI-001` | Responsible AI | Fact Grounding & Math Calculation Isolation | All financial metrics, budget remaining totals, and reservation figures are computed in Python/PostgreSQL rather than LLM inference, preventing math errors. | Not Tested | PENDING | - |
| `RAI-002` | Responsible AI | AI Output Validation & Key Normalization | Pydantic schema validation and key normalization handle small LLM JSON key variations (`item_name`, `name`, `item`) with 1 controlled retry on malformed structures. | Not Tested | PENDING | - |
