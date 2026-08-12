from datetime import date
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ExpenseBase(BaseModel):
    category: str = Field(..., description="Lodging, Food, Transport, Activities, Shopping, Misc")
    description: str = Field(..., min_length=1, max_length=255)
    estimated_amount: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Estimated expense amount")
    actual_amount: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Actual expense amount")
    expense_date: Optional[date] = None
    is_paid: bool = Field(False)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: str
    trip_id: str

    model_config = ConfigDict(from_attributes=True)


class CategoryBudgetBreakdown(BaseModel):
    category: str
    estimated_total: Decimal
    actual_total: Decimal


class BudgetSummaryResponse(BaseModel):
    trip_id: str
    trip_budget_estimated: Decimal
    total_estimated_spending: Decimal
    total_actual_spending: Decimal
    remaining_budget: Decimal
    category_breakdowns: List[CategoryBudgetBreakdown] = Field(default_factory=list)
