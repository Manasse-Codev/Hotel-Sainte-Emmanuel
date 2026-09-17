from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    reservation_id: str
    amount: int
    payment_method: str = "Wave"

class PaymentStatusUpdate(BaseModel):
    status: str  # "pending", "validated", "failed"

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
