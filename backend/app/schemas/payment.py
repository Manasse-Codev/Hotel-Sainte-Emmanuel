from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class PaymentCreate(BaseModel):
    reservation_id: str = Field(..., min_length=1, max_length=50)
    amount: Optional[int] = Field(None, ge=1, le=100_000_000)
    payment_method: str = Field("Wave", min_length=2, max_length=50)

    class Config:
        extra = "ignore"

class PaymentStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|validated|failed)$")

class PaymentOut(BaseModel):
    id: str
    reservation_id: str
    user_id: int
    amount: int
    status: str
    payment_method: str
    transaction_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
