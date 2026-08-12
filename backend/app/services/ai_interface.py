from abc import ABC, abstractmethod
from typing import Dict, List, Any


class BaseAIService(ABC):
    """
    Abstract AI Service Interface for TripCraft AI.
    Isolates provider-specific AI integrations from FastAPI routes, DB logic, and the UI.
    """

    @abstractmethod
    async def generate_itinerary(self, trip_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate day-by-day itinerary JSON items for a trip."""
        pass

    @abstractmethod
    async def generate_packing_list(self, trip_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate packing item recommendations for a trip."""
        pass

    @abstractmethod
    async def generate_chat_response(
        self, trip_context: Dict[str, Any], chat_history: List[Dict[str, Any]], user_message: str
    ) -> str:
        """Generate a context-aware natural language assistant response."""
        pass

    @abstractmethod
    async def generate_trip_summary(self, trip_context: Dict[str, Any]) -> str:
        """Generate a concise narrative trip summary."""
        pass
