from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.budget import ExpenseCreate, ExpenseUpdate, ExpenseResponse, BudgetSummaryResponse
from app.services.budget_service import BudgetService

router = APIRouter(tags=["Budget Tracker"])


@router.get("/trips/{trip_id}/budget", response_model=BudgetSummaryResponse)
async def get_trip_budget(trip_id: str, db: AsyncSession = Depends(get_db)):
    """Calculate and return overall budget summary and expense list for a trip."""
    return await BudgetService.get_budget_summary(db, trip_id)


@router.post("/trips/{trip_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(trip_id: str, data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new expense record associated with a trip."""
    return await BudgetService.create_expense(db, trip_id, data)


@router.put("/trips/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, data: ExpenseUpdate, db: AsyncSession = Depends(get_db)):
    """Update fields of an existing expense record."""
    return await BudgetService.update_expense(db, expense_id, data)


@router.delete("/trips/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an expense record by ID."""
    await BudgetService.delete_expense(db, expense_id)
    return None
