from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.trip import Trip
from app.models.budget import Expense
from app.schemas.budget import (
    ExpenseCreate,
    ExpenseUpdate,
    BudgetSummaryResponse,
    CategoryBudgetBreakdown,
)

SUPPORTED_CATEGORIES = [
    "Lodging",
    "Transportation",
    "Food",
    "Activities",
    "Shopping",
    "Other",
]


class BudgetService:
    @staticmethod
    async def get_budget_summary(db: AsyncSession, trip_id: str) -> BudgetSummaryResponse:
        """
        Calculate trip budget statistics and totals using exact Python Decimal arithmetic.
        """
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        trip = res_trip.scalar_one_or_none()
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        stmt_exp = select(Expense).where(Expense.trip_id == trip_id).order_by(Expense.expense_date.asc().nulls_last())
        res_exp = await db.execute(stmt_exp)
        expenses = list(res_exp.scalars().all())

        # Exact Decimal calculations
        trip_budget = Decimal(str(trip.budget_estimated)) if trip.budget_estimated is not None else Decimal("0.00")

        total_est = Decimal("0.00")
        total_act = Decimal("0.00")

        cat_map: Dict[str, Dict[str, Any]] = {
            cat: {"estimated_total": Decimal("0.00"), "actual_total": Decimal("0.00"), "count": 0}
            for cat in SUPPORTED_CATEGORIES
        }

        for exp in expenses:
            est_val = Decimal(str(exp.estimated_amount)) if exp.estimated_amount is not None else Decimal("0.00")
            act_val = Decimal(str(exp.actual_amount)) if exp.actual_amount is not None else Decimal("0.00")

            total_est += est_val
            total_act += act_val

            cat = exp.category if exp.category in cat_map else "Other"
            if cat not in cat_map:
                cat_map[cat] = {"estimated_total": Decimal("0.00"), "actual_total": Decimal("0.00"), "count": 0}

            cat_map[cat]["estimated_total"] += est_val
            cat_map[cat]["actual_total"] += act_val
            cat_map[cat]["count"] += 1

        est_remaining = trip_budget - total_est
        act_remaining = trip_budget - total_act

        breakdowns = [
            CategoryBudgetBreakdown(
                category=cat_name,
                estimated_total=cat_data["estimated_total"],
                actual_total=cat_data["actual_total"],
                count=cat_data["count"]
            )
            for cat_name, cat_data in cat_map.items()
            if cat_data["count"] > 0 or cat_name in SUPPORTED_CATEGORIES
        ]

        return BudgetSummaryResponse(
            trip_id=trip_id,
            trip_budget_estimated=trip_budget,
            total_estimated_spending=total_est,
            total_actual_spending=total_act,
            estimated_budget_remaining=est_remaining,
            actual_budget_remaining=act_remaining,
            category_breakdowns=breakdowns,
            expenses=expenses  # Pydantic validates into ExpenseResponse list
        )

    @staticmethod
    async def create_expense(db: AsyncSession, trip_id: str, data: ExpenseCreate) -> Expense:
        """Create a new expense associated with a trip."""
        stmt_trip = select(Trip).where(Trip.id == trip_id)
        res_trip = await db.execute(stmt_trip)
        if not res_trip.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with ID '{trip_id}' not found."
            )

        expense = Expense(
            trip_id=trip_id,
            category=data.category,
            description=data.description,
            estimated_amount=data.estimated_amount,
            actual_amount=data.actual_amount,
            expense_date=data.expense_date,
            is_paid=data.is_paid,
        )
        db.add(expense)
        await db.commit()
        await db.refresh(expense)
        return expense

    @staticmethod
    async def update_expense(db: AsyncSession, expense_id: str, data: ExpenseUpdate) -> Expense:
        """Update an existing expense record."""
        stmt = select(Expense).where(Expense.id == expense_id)
        res = await db.execute(stmt)
        expense = res.scalar_one_or_none()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID '{expense_id}' not found."
            )

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(expense, key, value)

        await db.commit()
        await db.refresh(expense)
        return expense

    @staticmethod
    async def delete_expense(db: AsyncSession, expense_id: str) -> None:
        """Delete an expense record by ID."""
        stmt = select(Expense).where(Expense.id == expense_id)
        res = await db.execute(stmt)
        expense = res.scalar_one_or_none()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID '{expense_id}' not found."
            )

        await db.delete(expense)
        await db.commit()
