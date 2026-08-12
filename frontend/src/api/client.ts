import {
  HealthResponse,
  Trip,
  TripCreateInput,
  TripUpdateInput,
  Reservation,
  ReservationCreateInput,
  ReservationUpdateInput,
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  BudgetSummary,
  PackingItem,
  PackingItemCreateInput,
  PackingItemUpdateInput,
  ChatMessage,
  ChatHistoryResponse,
} from '../types/trip';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchHealth(): Promise<HealthResponse> {
  const url = `${BASE_URL}/api/v1/health`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error(`Health check failed with status: ${response.status}`);
  return response.json();
}

export async function fetchTrips(): Promise<Trip[]> {
  const url = `${BASE_URL}/api/v1/trips`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch trips: ${response.status}`);
  return response.json();
}

export async function fetchTripById(id: string): Promise<Trip> {
  const url = `${BASE_URL}/api/v1/trips/${id}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error(`Trip not found (404)`);
    throw new Error(`Failed to fetch trip details: ${response.status}`);
  }
  return response.json();
}

export async function createTrip(payload: TripCreateInput): Promise<Trip> {
  const url = `${BASE_URL}/api/v1/trips`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create trip (${response.status})`);
  }
  return response.json();
}

export async function updateTrip(id: string, payload: TripUpdateInput): Promise<Trip> {
  const url = `${BASE_URL}/api/v1/trips/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update trip (${response.status})`);
  }
  return response.json();
}

export async function deleteTrip(id: string): Promise<void> {
  const url = `${BASE_URL}/api/v1/trips/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete trip (${response.status})`);
  }
}

export async function fetchItinerary(tripId: string): Promise<any[]> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/itinerary`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch itinerary (${response.status})`);
  }
  return response.json();
}

export async function generateItinerary(tripId: string, overwrite: boolean = false): Promise<any[]> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/itinerary/generate?overwrite=${overwrite}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to generate AI itinerary (${response.status})`);
  }
  return response.json();
}

export async function updateActivity(tripId: string, activityId: string, payload: any): Promise<any> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/itinerary/activities/${activityId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update activity (${response.status})`);
  }
  return response.json();
}

export async function deleteActivity(tripId: string, activityId: string): Promise<void> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/itinerary/activities/${activityId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete activity (${response.status})`);
  }
}

// --- Reservation APIs ---
export async function fetchReservations(tripId: string): Promise<Reservation[]> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/reservations`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch reservations (${response.status})`);
  }
  return response.json();
}

export async function createReservation(tripId: string, payload: ReservationCreateInput): Promise<Reservation> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/reservations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create reservation (${response.status})`);
  }
  return response.json();
}

export async function updateReservation(reservationId: string, payload: ReservationUpdateInput): Promise<Reservation> {
  const url = `${BASE_URL}/api/v1/trips/reservations/${reservationId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update reservation (${response.status})`);
  }
  return response.json();
}

export async function deleteReservation(reservationId: string): Promise<void> {
  const url = `${BASE_URL}/api/v1/trips/reservations/${reservationId}`;
  const response = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete reservation (${response.status})`);
  }
}

// --- Budget & Expense APIs ---
export async function fetchBudgetSummary(tripId: string): Promise<BudgetSummary> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/budget`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch budget summary (${response.status})`);
  }
  return response.json();
}

export async function createExpense(tripId: string, payload: ExpenseCreateInput): Promise<Expense> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/expenses`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create expense (${response.status})`);
  }
  return response.json();
}

export async function updateExpense(expenseId: string, payload: ExpenseUpdateInput): Promise<Expense> {
  const url = `${BASE_URL}/api/v1/trips/expenses/${expenseId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update expense (${response.status})`);
  }
  return response.json();
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const url = `${BASE_URL}/api/v1/trips/expenses/${expenseId}`;
  const response = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete expense (${response.status})`);
  }
}

// --- Packing Assistant APIs ---
export async function fetchPackingItems(tripId: string): Promise<PackingItem[]> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/packing`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch packing items (${response.status})`);
  }
  return response.json();
}

export async function generatePackingList(tripId: string, overwrite: boolean = false): Promise<PackingItem[]> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/packing/generate?overwrite=${overwrite}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to generate AI packing list (${response.status})`);
  }
  return response.json();
}

export async function createPackingItem(tripId: string, payload: PackingItemCreateInput): Promise<PackingItem> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/packing/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to add packing item (${response.status})`);
  }
  return response.json();
}

export async function updatePackingItem(itemId: string, payload: PackingItemUpdateInput): Promise<PackingItem> {
  const url = `${BASE_URL}/api/v1/trips/packing/items/${itemId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update packing item (${response.status})`);
  }
  return response.json();
}

export async function deletePackingItem(itemId: string): Promise<void> {
  const url = `${BASE_URL}/api/v1/trips/packing/items/${itemId}`;
  const response = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete packing item (${response.status})`);
  }
}

// --- Ask My Trip Assistant APIs ---
export async function fetchChatHistory(tripId: string): Promise<ChatHistoryResponse> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/chat`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch chat history (${response.status})`);
  }
  return response.json();
}

export async function sendChatMessage(tripId: string, message: string): Promise<ChatMessage> {
  const url = `${BASE_URL}/api/v1/trips/${tripId}/chat`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Assistant error (${response.status})`);
  }
  return response.json();
}
