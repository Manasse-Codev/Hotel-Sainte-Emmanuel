from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.review import Review
from ..models.activity import Activity
from ..schemas.review import ReviewCreate, ReviewOut
from ..core.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("", response_model=list[ReviewOut])
def get_approved_reviews(db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.status == "approved")
        .order_by(Review.created_at.desc())
        .all()
    )

@router.get("/my", response_model=list[ReviewOut])
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )

@router.post("", response_model=ReviewOut)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = Review(
        user_id=current_user.id,
        reservation_id=data.reservation_id,
        rating=data.rating,
        comment=data.comment.strip(),
        status="approved",  # auto-approved for fluid experience, can be moderated in admin
    )
    db.add(review)

    act = Activity(
        user_id=current_user.id,
        action="review",
        description=f"Nouvel avis déposé ({data.rating}/5 étoiles)",
    )
    db.add(act)
    db.commit()
    db.refresh(review)
    return review
