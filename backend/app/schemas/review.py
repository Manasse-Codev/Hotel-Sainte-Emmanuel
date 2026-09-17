from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .user import UserOut

class ReviewCreate(BaseModel):
    reservation_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewStatusUpdate(BaseModel):
    status: str  # "pending", "approved", "rejected"

class ReviewOut(BaseModel):
    id: int
    user_id: int
    reservation_id: Optional[str] = None
    rating: int
    comment: str
    status: str
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True
