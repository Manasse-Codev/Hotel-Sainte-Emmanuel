from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ActivityOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True
