# Assignment 5.4 — Comprehensive Testing Checklist for TripCraft AI

**Baseline Tag**: `pre-5.4-baseline` (Commit `b776188`)  
**Status Key**: `PENDING` (Not yet executed), `PASS` (Verified success), `FAIL` (Defect identified)

---

## 1. Dashboard & Core Navigation

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DASH-001` | Dashboard | Initial dashboard load | Main header, system architecture health card, and trip grid render without errors. | Not Tested | PENDING | - |
| `DASH-002` | Dashboard | "Check System Health" button click | Pings `/api/v1/health` and updates health status badges (FastAPI, Postgres, Ollama). | Not Tested | PENDING | - |
| `DASH-003` | Dashboard | Trip Search/Filter input | Filters visible trip cards in real-time by title or destination keyword. | Not Tested | PENDING | - |
| `DASH-004` | Dashboard | Search with no matching keywords | Displays clean empty search state message ("No trips match your search criteria"). | Not Tested | PENDING | - |
| `DASH-005` | Dashboard | "+ Create New Trip" button click | Opens Trip Form Modal in creation mode with empty fields. | Not Tested | PENDING | - |
| `DASH-006` | Dashboard | Trip Card "View Details" button click | Opens 6-tab TripDetailModal for the selected trip. | Not Tested | PENDING | - |
| `DASH-007` | Dashboard | Trip Card "Edit" button click | Opens Trip Form Modal pre-populated with trip data. | Not Tested | PENDING | - |
| `DASH-008` | Dashboard | Trip Card "Delete" button click | Opens Delete Confirmation Modal with trip title. | Not Tested | PENDING | - |
| `DASH-009` | Dashboard | Delete confirmation approval | Sends `DELETE /api/v1/trips/{id}`, removes trip card from grid, and updates UI. | Not Tested | PENDING | - |
| `DASH-010` | Dashboard | Delete confirmation cancel | Closes modal without deleting trip record from database. | Not Tested | PENDING | - |

---

## 2. Trip Creation & Editing

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TRIP-001` | Trip Form | Submit valid trip form | Successfully creates trip record in PostgreSQL and displays card on dashboard. | Not Tested | PENDING | - |
| `TRIP-002` | Trip Form | Submit with blank title | Rejects submission with client alert ("Title cannot be blank") and HTTP 422 if forced. | Not Tested | PENDING | - |
| `TRIP-003` | Trip Form | Submit with whitespace-only title | Rejects submission with validation alert; whitespace trimmed. | Not Tested | PENDING | - |
| `TRIP-004` | Trip Form | Submit with blank destination | Rejects submission with validation error alert. | Not Tested | PENDING | - |
| `TRIP-005` | Trip Form | End date before start date | Rejects submission with alert ("End date cannot be before start date") and HTTP 422. | Not Tested | PENDING | - |
| `TRIP-006` | Trip Form | Zero travelers count | Rejects submission with alert ("Travelers count must be at least 1"). | Not Tested | PENDING | - |
| `TRIP-007` | Trip Form | Negative travelers count | Rejects submission with alert and HTTP 422 validation error. | Not Tested | PENDING | - |
| `TRIP-008` | Trip Form | Negative budget amount | Rejects submission with alert ("Estimated budget cannot be negative"). | Not Tested | PENDING | - |
| `TRIP-009` | Trip Form | Very large budget ($99,999,999.99) | Successfully formats and saves decimal without float overflow. | Not Tested | PENDING | - |
| `TRIP-010` | Trip Form | Special characters in title (`<script>alert(1)</script>`) | Sanitizes/escapes text cleanly without HTML injection or script execution. | Not Tested | PENDING | - |
| `TRIP-011` | Trip Form | Very long title (300+ characters) | Enforces max length limits or displays inline validation error. | Not Tested | PENDING | - |
| `TRIP-012` | Trip Form | Multiple interests selection | Correctly saves and renders tags (e.g. "Architecture", "Food", "Museums"). | Not Tested | PENDING | - |
| `TRIP-013` | Trip Form | Edit existing trip and save | Updates PostgreSQL record and reflects changes on dashboard and modal. | Not Tested | PENDING | - |
| `TRIP-014` | Trip Form | Rapid double-click on Save button | Prevents duplicate API submission via loading/disabled state. | Not Tested | PENDING | - |

---

## 3. Itinerary Generator & Activity Editor

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ITIN-001` | Itinerary | View existing itinerary days | Displays chronological day cards with 2–3 activities per day and formatted costs. | Not Tested | PENDING | - |
| `ITIN-002` | Itinerary | Click "Generate AI Itinerary" (no existing itinerary) | Calls Ollama (`gemma3:1b`), displays spinner, and renders generated itinerary. | Not Tested | PENDING | - |
| `ITIN-003` | Itinerary | Click "Regenerate AI Itinerary" (when itinerary exists) | Displays Overwrite Confirmation Modal before calling Ollama. | Not Tested | PENDING | - |
| `ITIN-004` | Itinerary | Cancel overwrite confirmation | Closes confirmation modal and leaves existing itinerary intact. | Not Tested | PENDING | - |
| `ITIN-005` | Itinerary | Confirm overwrite | Replaces existing AI itinerary items in PostgreSQL with fresh generated days. | Not Tested | PENDING | - |
| `ITIN-006` | Itinerary | Edit Activity modal open & submit | Updates activity title, time slot, location, estimated cost, and category. | Not Tested | PENDING | - |
| `ITIN-007` | Itinerary | Delete Activity & confirm | Removes activity from itinerary day and updates DB. | Not Tested | PENDING | - |
| `ITIN-008` | Itinerary | Edit activity with negative cost | Rejects update with validation error alert. | Not Tested | PENDING | - |
| `ITIN-009` | Itinerary | Ollama server offline / unreachable | Returns clear HTTP 503 error alert ("Ollama AI service is offline or unreachable"). | Not Tested | PENDING | - |

---

## 4. Reservation Organizer

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RES-001` | Reservations | View reservations list | Displays reservation cards with badges for type (`Lodging`, `Transportation`, `Restaurant`, `Activity`) and status. | Not Tested | PENDING | - |
| `RES-002` | Reservations | Category filter pills (`All`, `Lodging`, etc.) | Filters displayed reservation cards by selected type. | Not Tested | PENDING | - |
| `RES-003` | Reservations | Add new reservation (valid data) | Persists record in PostgreSQL and displays card under correct type. | Not Tested | PENDING | - |
| `RES-004` | Reservations | Add reservation with blank title | Rejects with alert ("Reservation title cannot be blank") and HTTP 422. | Not Tested | PENDING | - |
| `RES-005` | Reservations | End date/time before start date/time | Rejects with alert ("End time cannot be before start time") and HTTP 422. | Not Tested | PENDING | - |
| `RES-006` | Reservations | Negative cost amount | Rejects with alert ("Cost cannot be negative") and HTTP 422. | Not Tested | PENDING | - |
| `RES-007` | Reservations | Edit existing reservation | Updates fields (provider, confirmation code, cost, status) in DB and UI. | Not Tested | PENDING | - |
| `RES-008` | Reservations | Delete reservation & confirm | Removes reservation from PostgreSQL and updates list. | Not Tested | PENDING | - |
| `RES-009` | Reservations | Status change (`Confirmed` -> `Cancelled`) | Updates status badge and preserves cost records. | Not Tested | PENDING | - |

---

## 5. Budget Tracker

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BUD-001` | Budget | Display Summary Stat Cards | Correctly displays Trip Budget, Total Est Spent, Total Act Spent, Est Remaining, Act Remaining. | Not Tested | PENDING | - |
| `BUD-002` | Budget | Category Breakdown table | Sums estimated and actual expenses by category (`Lodging`, `Food`, etc.) accurately. | Not Tested | PENDING | - |
| `BUD-003` | Budget | Add valid expense | Inserts expense into PostgreSQL and updates stat cards immediately. | Not Tested | PENDING | - |
| `BUD-004` | Budget | Add expense with blank description | Rejects with alert ("Expense description cannot be blank") and HTTP 422. | Not Tested | PENDING | - |
| `BUD-005` | Budget | Add expense with negative estimated/actual amount | Rejects with alert ("Expense amounts cannot be negative") and HTTP 422. | Not Tested | PENDING | - |
| `BUD-006` | Budget | Edit existing expense | Updates amounts/category in DB and recalculates budget balances in real-time. | Not Tested | PENDING | - |
| `BUD-007` | Budget | Toggle "Is Paid" checkbox | Toggles paid status in DB without altering amounts. | Not Tested | PENDING | - |
| `BUD-008` | Budget | Delete expense & confirm | Deletes expense record and updates budget remaining cards. | Not Tested | PENDING | - |
| `BUD-009` | Budget | Zero value expense ($0.00) | Successfully saves $0.00 expense without error. | Not Tested | PENDING | - |

---

## 6. Packing Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PACK-001` | Packing | Initial load / empty state | Renders empty state with "Generate AI Packing List" button. | Not Tested | PENDING | - |
| `PACK-002` | Packing | Generate AI packing list (`gemma3:1b`) | Returns 8–14 items across 6 categories, saves in DB with `is_ai_suggested=True`. | Not Tested | PENDING | - |
| `PACK-003` | Packing | Toggle `is_packed` checkbox | Toggles item state in DB and updates progress bar (`X/Y packed`). | Not Tested | PENDING | - |
| `PACK-004` | Packing | Add custom manual item | Inserts item with `is_ai_suggested=False` and displays "Custom" badge. | Not Tested | PENDING | - |
| `PACK-005` | Packing | Edit packing item (name/category) | Updates item details in PostgreSQL and UI. | Not Tested | PENDING | - |
| `PACK-006` | Packing | Delete packing item & confirm | Removes item from list and updates progress bar. | Not Tested | PENDING | - |
| `PACK-007` | Packing | Regenerate AI packing list (with custom items present) | Opens confirmation modal; upon confirm, replaces AI items while preserving manual items intact. | Not Tested | PENDING | - |
| `PACK-008` | Packing | Checkbox state persistence after page refresh | Re-querying DB confirms all packed checkbox states remain unchanged. | Not Tested | PENDING | - |
| `PACK-009` | Packing | Ollama offline during packing generation | Displays clear HTTP 503 error alert without losing existing items. | Not Tested | PENDING | - |

---

## 7. Ask My Trip Assistant

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHAT-001` | Ask My Trip | Click suggestion pill: "What reservations do I have?" | Instantly returns deterministic list of confirmed reservations (< 0.1s). | Not Tested | PENDING | - |
| `CHAT-002` | Ask My Trip | Click suggestion pill: "How much of my budget have I spent?" | Instantly returns exact spent ($1,425.00) and remaining ($375.00) amounts (< 0.1s). | Not Tested | PENDING | - |
| `CHAT-003` | Ask My Trip | Click suggestion pill: "Which day has the most activities?" | Instantly returns busiest day details (< 0.1s). | Not Tested | PENDING | - |
| `CHAT-004` | Ask My Trip | Click suggestion pill: "What do I still need to pack?" | Instantly returns remaining unpacked items list (< 0.1s). | Not Tested | PENDING | - |
| `CHAT-005` | Ask My Trip | Click suggestion pill: "Summarize my trip." | Calls local Ollama (`gemma3:1b`) with pre-calculated facts and displays narrative summary. | Not Tested | PENDING | - |
| `CHAT-006` | Ask My Trip | Ask question about non-existent data ("Where is my passport scan?") | Returns clear response stating information is unavailable rather than hallucinating. | Not Tested | PENDING | - |
| `CHAT-007` | Ask My Trip | Submit blank / whitespace prompt | Rejects submission with alert ("Message prompt cannot be blank") or disables button. | Not Tested | PENDING | - |
| `CHAT-008` | Ask My Trip | Chat history persistence after page refresh | All past user and assistant messages remain visible in chronological order. | Not Tested | PENDING | - |
| `CHAT-009` | Ask My Trip | Ollama offline during narrative summary request | Displays clear HTTP 503 error alert ("Ollama AI service is offline"). | Not Tested | PENDING | - |

---

## 8. Accessibility (A11Y) & Responsive Design

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `A11Y-001` | Accessibility | Keyboard Navigation (Tab / Shift+Tab) | Logical focus order through header, cards, modals, tabs, and form controls. | Not Tested | PENDING | - |
| `A11Y-002` | Accessibility | Visible Focus Indicator | All interactive elements display high-contrast focus rings when focused. | Not Tested | PENDING | - |
| `A11Y-003` | Accessibility | Enter / Space Activation | All buttons, tabs, checkboxes, and links activate cleanly using Enter or Space. | Not Tested | PENDING | - |
| `A11Y-004` | Accessibility | Escape key modal close | Pressing Escape dismisses active form or delete confirmation modals. | Not Tested | PENDING | - |
| `A11Y-005` | Accessibility | Form Input Labels | Every text, number, date, and select field has explicit `<label>` or `aria-label`. | Not Tested | PENDING | - |
| `A11Y-006` | Accessibility | Icon Button Names | All icon-only buttons (close, edit, delete) have `aria-label` or `title`. | Not Tested | PENDING | - |
| `A11Y-007` | Accessibility | Focus Trapping in Modals | Focus remains constrained within open modal dialogs (`role="dialog"`). | Not Tested | PENDING | - |
| `RESP-001` | Responsive | Desktop viewport (1280px+) | Full multi-column grid layout, visible stat cards, side-by-side modal panels. | Not Tested | PENDING | - |
| `RESP-002` | Responsive | Tablet viewport (768px - 1023px) | 2-column adaptive layout, scrollable navigation tabs, responsive cards. | Not Tested | PENDING | - |
| `RESP-003` | Responsive | Mobile viewport (< 767px) | Single-column layout, touch-friendly touch targets (44px+), no horizontal overflow. | Not Tested | PENDING | - |

---

## 9. Responsible AI Behavior

| ID | Area | Test Case | Expected Result | Actual Result | Status | Bug ID/Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RAI-001` | Responsible AI | Fact-first budget/reservation answers | Financial facts originate from PostgreSQL queries in Python, avoiding LLM math errors. | Not Tested | PENDING | - |
| `RAI-002` | Responsible AI | Refusal to hallucinate missing facts | Explicitly states data is unavailable if requested info is absent from database. | Not Tested | PENDING | - |
| `RAI-003` | Responsible AI | Malformed AI JSON handling | Rejects malformed LLM output with Pydantic validation and 1 controlled retry. | Not Tested | PENDING | - |
| `RAI-004` | Responsible AI | Incomplete day itinerary check | Rejects generated itineraries containing empty days (< 2 activities per day). | Not Tested | PENDING | - |
| `RAI-005` | Responsible AI | Preservation of custom packing items | Regeneration replaces AI items while retaining user-added items and packed status. | Not Tested | PENDING | - |
| `RAI-006` | Responsible AI | Graceful Ollama offline handling | Returns explicit HTTP 503 error alert instead of mock fallback or broken state. | Not Tested | PENDING | - |

---

## Test Inventory Summary

- **Total Test Cases Identified**: **75**
- **Categories**:
  1. Dashboard & Core Navigation: `10`
  2. Trip Creation & Editing: `14`
  3. Itinerary Generator & Activity Editor: `9`
  4. Reservation Organizer: `9`
  5. Budget Tracker: `9`
  6. Packing Assistant: `9`
  7. Ask My Trip Assistant: `9`
  8. Accessibility & Responsive Design: `10`
  9. Responsible AI Behavior: `6`
