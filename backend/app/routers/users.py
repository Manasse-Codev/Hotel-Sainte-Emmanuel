from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.activity import Activity
from ..schemas.user import UserOut, UserUpdateProfile
from ..core.security import hash_password
from ..core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.put("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.first_name is not None:
        current_user.first_name = data.first_name.strip()
    if data.last_name is not None:
        current_user.last_name = data.last_name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.password:
        current_user.password_hash = hash_password(data.password)

    act = Activity(
        user_id=current_user.id,
        action="profile_update",
        description="Mise à jour des informations de profil",
    )
    db.add(act)
    db.commit()
    db.refresh(current_user)
    return current_user
