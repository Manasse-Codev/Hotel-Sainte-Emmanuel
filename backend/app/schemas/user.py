from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    loyalty_tier: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdateProfile(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserStats(BaseModel):
    total_stays: int
    total_nights: int
    loyalty_tier: str
    points: int
