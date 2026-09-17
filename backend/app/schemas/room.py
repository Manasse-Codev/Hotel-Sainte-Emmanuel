import json
from typing import Optional, Any
from pydantic import BaseModel, field_validator

class RoomBase(BaseModel):
    name: str
    price: int
    price_display: str
    capacity: str
    badge: Optional[str] = None
    badge_type: Optional[str] = None
    short_desc: str
    full_desc: str
    amenities: list[str]
    image: str
    status: str = "available"

class RoomCreate(RoomBase):
    id: str

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    price_display: Optional[str] = None
    capacity: Optional[str] = None
    badge: Optional[str] = None
    badge_type: Optional[str] = None
    short_desc: Optional[str] = None
    full_desc: Optional[str] = None
    amenities: Optional[list[str]] = None
    image: Optional[str] = None
    status: Optional[str] = None

class RoomOut(BaseModel):
    id: str
    name: str
    price: int
    price_display: str
    capacity: str
    badge: Optional[str] = None
    badge_type: Optional[str] = None
    short_desc: str
    full_desc: str
    amenities: list[str]
    image: str
    status: str

    @field_validator("amenities", mode="before")
    @classmethod
    def parse_amenities(cls, v: Any) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [s.strip() for s in v.split(",") if s.strip()]
        return []

    class Config:
        from_attributes = True
