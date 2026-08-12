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

