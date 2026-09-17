from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.activity import Activity
from ..schemas.activity import ActivityOut
from ..core.deps import get_current_user

router = APIRouter(prefix="/activities", tags=["activities"])

@router.get("/my", response_model=list[ActivityOut])
def get_my_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .limit(50)
        .all()
    )
