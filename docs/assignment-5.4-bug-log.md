# Assignment 5.4 — Bug Log for TripCraft AI

**Baseline Tag**: `pre-5.4-baseline` (Commit `b776188`)

---

## Bug Inventory

| Bug ID | Test ID | Affected Component | Observed Behavior | Expected Behavior | Reproduction Steps | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *(None)* | - | - | No functional bugs discovered in Batch 1 API verification. All REST endpoints returned expected status codes and validation messages. | - | - | - | OPEN |

---

## Usability & Behavioral Notes (Non-Bug Observations)

1. **`TRIP-002e` (Negative Budget Payload Key Precision)**:
   - *Observation*: The REST API schema expects field name `budget_estimated`. Passing an unmapped payload key like `estimated_budget` is safely ignored as `None` (which defaults to valid optional field) rather than rejecting the payload. When `budget_estimated: "-500.00"` is correctly supplied, the Pydantic schema validation returns HTTP 422 with `Input should be greater than or equal to 0`.
