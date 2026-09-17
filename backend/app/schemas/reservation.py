from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field
from .room import RoomOut

class CheckAvailabilityRequest(BaseModel):
    room_id: str = Field(..., min_length=1, max_length=50)
    check_in: date
    check_out: date

class CheckAvailabilityResponse(BaseModel):
    available: bool
    nights: int
    price_per_night: int
    total_amount: int
    message: Optional[str] = None

class ReservationCreate(BaseModel):
    room_id: str = Field(..., min_length=1, max_length=50)
    guest_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=25)
    check_in: date
    check_out: date
    guests: int = Field(1, ge=1, le=10)
    special_requests: Optional[str] = Field(None, max_length=500)

    class Config:
        extra = "ignore"

class ReservationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|completed|cancelled)$")

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
