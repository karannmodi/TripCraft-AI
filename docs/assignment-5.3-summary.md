# Assignment 5.3 Development Summary Report — TripCraft AI

This document provides a summary of the implementation, architecture, prompts, challenges, and actual recorded development time for **TripCraft AI MVP** (Assignment 5.3).

---

## 1. AI Assistant Used

- **Pair Programming Assistant**: Antigravity AI (Google DeepMind Capstone Coding Assistant).
- **Local AI Service Engine**: Local Ollama AI server running `gemma3:1b` (1 Billion parameter model).

---

## 2. Major Prompts & Strategies Used

1. **Per-Day Structured Prompt Decomposition**:
   - Multi-day itinerary generation prompts to 1B parameter models often caused empty days or date drift.
   - *Strategy*: Decomposed itinerary creation into single-day structured JSON prompt calls in Python (`generate_day_itinerary`), iterating through every required calendar date with explicit Pydantic schema validation and 1 controlled retry on error.

2. **Fact-First / Hallucination-Risk-Reducing Q&A Architecture**:
   - *Strategy*: Rather than passing factual questions directly to the LLM where math/fact hallucination can occur, FastAPI retrieves and calculates factual values from PostgreSQL FIRST in Python (budget spent/remaining, reservations list, busiest day, packing stats). Deterministic answers are returned directly to the user in < 0.1s, while Ollama (`gemma3:1b`) is called for narrative synthesis (e.g., *"Summarize my trip"*).

3. **Robust Key Normalization**:
   - *Strategy*: To handle key name variations from small LLMs (`name`, `item`, `description`, `item_packed`), `OllamaAIService._parse_and_validate_packing` normalizes JSON keys prior to Pydantic validation.

4. **Safe Packing Regeneration**:
   - *Strategy*: `PackingService.generate_and_save_packing_list` deletes ONLY items marked `is_ai_suggested = True`, leaving manually created user items and their checked state untouched in PostgreSQL.

---

## 3. Major Features Implemented

- **Phase 1**: Workspace & Database Foundation (FastAPI, SQLAlchemy 2.0 Async, PostgreSQL database, health checks).
- **Phase 2**: Full-Stack Trip Management CRUD (React UI, FastAPI endpoints, PostgreSQL persistence for trip destination, dates, travelers count, budget, pace, preferences).
- **Phase 3**: AI Day-by-Day Itinerary Generator (`gemma3:1b` integration with date completeness validation, activity order indices, and single-activity CRUD edits).
- **Phase 4**: Reservation Organizer (`Lodging`, `Transportation`, `Restaurant`, `Activity`) & Budget Tracker (exact Python `Decimal` / PostgreSQL `NUMERIC(10,2)` arithmetic, summary stat cards, category breakdowns).
- **Phase 5**: AI Packing Assistant (6 categories, persistent checkboxes, manual CRUD, safe regeneration) & Ask My Trip Assistant (Fact-First Q&A + Ollama narrative summary).
- **6-Tab Sub-Navigation**: Integrated sub-navigation bar in `TripDetailModal` (*Trip Details*, *Itinerary*, *Reservations*, *Budget Tracker*, *Packing*, *Ask My Trip*).

---

## 4. Major Development Challenges & Resolutions

1. **Empty Itinerary Days on Small LLM Output**:
   - *Challenge*: Prompts asking for a 4-day trip resulted in Day 1 having activities while Days 2–4 had zero activities.
   - *Resolution*: Switched to single-day prompt generation in Python with strict date completeness checks before saving to PostgreSQL.

2. **Financial Math & Fact Hallucinations**:
   - *Challenge*: LLMs frequently miscalculate floating-point numbers or invent reservation dates/costs.
   - *Resolution*: Performed all currency calculations in Python `Decimal` and built a Fact-First Q&A router that answers factual questions directly from PostgreSQL data.

3. **LLM Schema Variation**:
   - *Challenge*: 1B model output varied key names (`item_name` vs `name`).
   - *Resolution*: Implemented key normalization in `OllamaAIService._parse_and_validate_packing` prior to Pydantic validation.

4. **Loss of Custom Packing Items on AI Regeneration**:
   - *Challenge*: Regenerating the packing list initially wiped manually added user items.
   - *Resolution*: Updated database service to delete ONLY `is_ai_suggested == True` items, retaining custom items and their checked state.

---

## 5. Improvements Compared to App #1

- **Modular Phase-by-Phase Execution**: Used safe local Git checkpoints before starting each new phase to ensure stable rollback points.
- **Strict Separation of Concerns**: Delegated arithmetic and deterministic logic strictly to FastAPI/Python, reserving LLMs for text recommendations and narrative summaries.
- **Schema-Driven API Boundaries**: Enforced Pydantic v2 schemas across all REST endpoints to prevent unexpected runtime errors.

---

## 6. Most Useful AI-Development Prompts

1. **Single-Day Structured JSON Prompt**:
   ```text
   Generate Day {day_number} ({date_str}) activities for '{title}' in {destination}.
   Context: {travelers} travelers, budget ${budget}, interests: {interests}, pace: {pace}, transport: {transport}.
   Requirements: Must contain at least 2 distinct activities (Morning, Afternoon, Evening). Return valid JSON.
   ```

2. **Fact-First Narrative Injection Prompt**:
   ```text
   You are TripCraft AI. You are provided with authoritative factual context retrieved directly from PostgreSQL:
   {context_summary}
   Answer the user's question concisely using ONLY the provided facts. Do not invent dates or costs.
   ```

---

## 7. Actual Recorded Development Time by Phase

Based on the documented logs in `docs/development-log.md`:

- **Phase 1 — Workspace & Database Foundation**: ~2.5 hours
- **Phase 2 — Full-Stack Trip Management CRUD**: ~3.0 hours
- **Phase 3 — Local AI Itinerary Generation Architecture**: ~3.5 hours
- **Phase 3 — Day Completeness & Quality Fixes**: ~2.5 hours
- **Phase 4 — Reservation Organizer & Budget Tracker**: ~2.0 hours
- **Phase 5 — Packing Assistant & Ask My Trip Assistant**: ~2.5 hours

### **Total Recorded Development Time: 16.0 hours**

---

## 8. Summary Status

- **Assignment 5.3 MVP Application Status**: **PASS — FULLY READY**
- **Repository Checkpoint**: Local commit `Phase 5: complete TripCraft AI MVP` created.
