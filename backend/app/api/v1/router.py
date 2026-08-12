from fastapi import APIRouter
from app.api.v1 import health, trips, itinerary, reservations, budget, packing, chat

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trips"])
api_router.include_router(itinerary.router, tags=["Itinerary"])
api_router.include_router(reservations.router, tags=["Reservations"])
api_router.include_router(budget.router, tags=["Budget Tracker"])
api_router.include_router(packing.router, tags=["Packing Assistant"])
api_router.include_router(chat.router, tags=["Ask My Trip Assistant"])
