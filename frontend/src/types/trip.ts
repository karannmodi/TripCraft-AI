export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_estimated?: string | null;
  interests?: string[];
  travel_pace: string;
  transportation_preference: string;
  created_at: string;
  updated_at: string;
}

export interface TripCreateInput {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_estimated?: string | null;
  interests?: string[];
  travel_pace: string;
  transportation_preference: string;
}

export interface TripUpdateInput {
  title?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers_count?: number;
  budget_estimated?: string | null;
  interests?: string[];
  travel_pace?: string;
  transportation_preference?: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  environment: string;
  database_status?: string;
  database_engine?: string;
}

export interface ItineraryActivity {
  id: string;
  itinerary_day_id: string;
  time_slot: string;
  title: string;
  description?: string | null;
  location?: string | null;
  estimated_cost?: string | number | null;
  category: string;
  order_index: number;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  notes?: string | null;
  activities: ItineraryActivity[];
}

export interface ItineraryActivityUpdateInput {
  time_slot?: string;
  title?: string;
  description?: string | null;
  location?: string | null;
  estimated_cost?: string | number | null;
  category?: string;
  order_index?: number;
}

export interface Reservation {
  id: string;
  trip_id: string;
  type: string; // Lodging, Transportation, Restaurant, Activity
  title: string;
  provider?: string | null;
  confirmation_code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cost: string;
  status: string; // Confirmed, Pending, Cancelled
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationCreateInput {
  type: string;
  title: string;
  provider?: string | null;
  confirmation_code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cost?: string | number;
  status?: string;
  notes?: string | null;
}

export interface ReservationUpdateInput {
  type?: string;
  title?: string;
  provider?: string | null;
  confirmation_code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cost?: string | number;
  status?: string;
  notes?: string | null;
}

export interface Expense {
  id: string;
  trip_id: string;
  category: string; // Lodging, Transportation, Food, Activities, Shopping, Other
  description: string;
  estimated_amount: string;
  actual_amount: string;
  expense_date?: string | null;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCreateInput {
  category: string;
  description: string;
  estimated_amount?: string | number;
  actual_amount?: string | number;
  expense_date?: string | null;
  is_paid?: boolean;
}

export interface ExpenseUpdateInput {
  category?: string;
  description?: string;
  estimated_amount?: string | number;
  actual_amount?: string | number;
  expense_date?: string | null;
  is_paid?: boolean;
}

export interface CategoryBudgetBreakdown {
  category: string;
  estimated_total: string;
  actual_total: string;
  count: number;
}

export interface BudgetSummary {
  trip_id: string;
  trip_budget_estimated: string;
  total_estimated_spending: string;
  total_actual_spending: string;
  estimated_budget_remaining: string;
  actual_budget_remaining: string;
  category_breakdowns: CategoryBudgetBreakdown[];
  expenses: Expense[];
}
