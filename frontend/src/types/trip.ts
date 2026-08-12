export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_estimated?: number | string;
  interests?: string[];
  travel_pace: string;
  transportation_preference: string;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  environment: string;
  database_status?: string;
  database_engine?: string;
}
