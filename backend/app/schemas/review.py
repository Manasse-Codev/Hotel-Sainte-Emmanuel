from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewUserOut(BaseModel):
    first_name: str
    last_name: str
    loyalty_tier: Optional[str] = "standard"

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    reservation_id: Optional[str] = Field(None, max_length=50)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=2, max_length=1000)

class ReviewStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected)$")

class ReviewOut(BaseModel):
    id: int
    user_id: int
    reservation_id: Optional[str] = None
    rating: int
    comment: str
    status: str
    created_at: datetime
    user: Optional[ReviewUserOut] = None

    class Config:
        from_attributes = True
