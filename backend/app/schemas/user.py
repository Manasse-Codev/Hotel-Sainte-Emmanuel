from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

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
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone: Optional[str] = Field(None, max_length=25)
    password: Optional[str] = Field(None, min_length=6, max_length=128)

    class Config:
        extra = "ignore"

class UserStats(BaseModel):
    total_stays: int
    total_nights: int
    loyalty_tier: str
    points: int
