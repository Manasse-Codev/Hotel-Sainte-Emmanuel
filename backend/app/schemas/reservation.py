from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from .room import RoomOut

class CheckAvailabilityRequest(BaseModel):
    room_id: str
    check_in: date
    check_out: date

class CheckAvailabilityResponse(BaseModel):
    available: bool
    nights: int
    price_per_night: int
    total_amount: int
    message: Optional[str] = None

class ReservationCreate(BaseModel):
    room_id: str
    guest_name: str
    phone: str
    check_in: date
    check_out: date
    guests: int = 1
    special_requests: Optional[str] = None

class ReservationStatusUpdate(BaseModel):
    status: str  # "pending", "confirmed", "completed", "cancelled"

class ReservationOut(BaseModel):
    id: str
    user_id: int
    room_id: str
    guest_name: str
    phone: str
    check_in: date
    check_out: date
    guests: int
    total_amount: int
    status: str
    special_requests: Optional[str] = None
    created_at: datetime
    room: Optional[RoomOut] = None

    class Config:
        from_attributes = True
