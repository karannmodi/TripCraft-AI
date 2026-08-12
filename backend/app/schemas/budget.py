from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, field_serializer


class ExpenseBase(BaseModel):
    category: str = Field(..., description="Lodging, Transportation, Food, Activities, Shopping, Other")
    description: str = Field(..., min_length=1, max_length=255, description="Expense description")
    estimated_amount: Decimal = Field(Decimal("0.00"), ge=0, description="Estimated expense amount")
    actual_amount: Decimal = Field(Decimal("0.00"), ge=0, description="Actual expense amount")
    expense_date: Optional[date] = None
    is_paid: bool = Field(False)

    @field_validator("description", mode="before")
    @classmethod
    def validate_non_blank_description(cls, v: str) -> str:
        if isinstance(v, str) and not v.strip():
            raise ValueError("Expense description cannot be blank.")
        return v

    @field_validator("estimated_amount", "actual_amount", mode="before")
    @classmethod
    def parse_decimal_amount(cls, v: Any) -> Decimal:
        if v is None or v == "":
            return Decimal("0.00")
        if isinstance(v, (int, float, str)):
            cleaned = str(v).replace("$", "").replace(",", "").strip()
            val = Decimal(cleaned)
            if val < 0:
                raise ValueError("Expense amount cannot be negative.")
            return val
        return v


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    estimated_amount: Optional[Decimal] = Field(None, ge=0)
    actual_amount: Optional[Decimal] = Field(None, ge=0)
    expense_date: Optional[date] = None
    is_paid: Optional[bool] = None

    @field_validator("description", mode="before")
    @classmethod
    def validate_non_blank_description_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str) and not v.strip():
            raise ValueError("Expense description cannot be blank.")
        return v

    @field_validator("estimated_amount", "actual_amount", mode="before")
    @classmethod
    def parse_decimal_amount_update(cls, v: Any) -> Optional[Decimal]:
        if v is None:
            return None
        cleaned = str(v).replace("$", "").replace(",", "").strip()
        val = Decimal(cleaned)
        if val < 0:
            raise ValueError("Expense amount cannot be negative.")
        return val


class ExpenseResponse(ExpenseBase):
    id: str
    trip_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("estimated_amount")
    def serialize_estimated(self, amt: Decimal, _info) -> str:
        return f"{amt:.2f}"

    @field_serializer("actual_amount")
    def serialize_actual(self, amt: Decimal, _info) -> str:
        return f"{amt:.2f}"


class CategoryBudgetBreakdown(BaseModel):
    category: str
    estimated_total: Decimal
    actual_total: Decimal
    count: int = 0

    @field_serializer("estimated_total")
    def serialize_est(self, amt: Decimal, _info) -> str:
        return f"{amt:.2f}"

    @field_serializer("actual_total")
    def serialize_act(self, amt: Decimal, _info) -> str:
        return f"{amt:.2f}"


class BudgetSummaryResponse(BaseModel):
    trip_id: str
    trip_budget_estimated: Decimal
    total_estimated_spending: Decimal
    total_actual_spending: Decimal
    estimated_budget_remaining: Decimal
    actual_budget_remaining: Decimal
    category_breakdowns: List[CategoryBudgetBreakdown] = Field(default_factory=list)
    expenses: List[ExpenseResponse] = Field(default_factory=list)

    @field_serializer(
        "trip_budget_estimated",
        "total_estimated_spending",
        "total_actual_spending",
        "estimated_budget_remaining",
        "actual_budget_remaining",
    )
    def serialize_totals(self, amt: Decimal, _info) -> str:
        return f"{amt:.2f}"
