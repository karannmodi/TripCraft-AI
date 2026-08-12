from fastapi import APIRouter
from app.api.v1 import health, trips, itinerary

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trips"])
api_router.include_router(itinerary.router, tags=["Itinerary"])


