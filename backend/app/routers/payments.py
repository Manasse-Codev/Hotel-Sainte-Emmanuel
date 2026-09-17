import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.reservation import Reservation
from ..models.payment import Payment
from ..models.notification import Notification
from ..models.activity import Activity
from ..schemas.payment import PaymentCreate, PaymentOut
from ..core.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/my", response_model=list[PaymentOut])
def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )

@router.post("", response_model=PaymentOut)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == data.reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé")

    if res.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible d'effectuer un paiement pour une réservation annulée",
        )

    # Prevent duplicate validated payments
    existing_paid = db.query(Payment).filter(
        Payment.reservation_id == res.id,
        Payment.status == "validated"
    ).first()
    if existing_paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette réservation a déjà fait l'objet d'un règlement validé.",
        )

    # Enforce server-authoritative amount: recalculate/verify
    expected_amount = res.total_amount
    if data.amount is not None and data.amount != expected_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Montant invalide. Le montant exact de la réservation est de {expected_amount:,} FCFA.",
        )

    pay_amount = expected_amount
    pay_id = f"PAY-2025-{random.randint(100, 999)}"
    ref = f"{data.payment_method.upper()}-CI-{random.randint(100000, 999999)}"

    payment = Payment(
        id=pay_id,
        reservation_id=res.id,
        user_id=current_user.id,
        amount=pay_amount,
        status="validated",
        payment_method=data.payment_method,
        transaction_reference=ref,
    )
    db.add(payment)

    # Auto-confirm reservation upon successful payment if it was pending
    if res.status == "pending":
        res.status = "confirmed"

    notif = Notification(
        user_id=current_user.id,
        title="Paiement validé",
        message=f"Votre règlement de {pay_amount:,} FCFA pour la réservation {res.id} a été confirmé ({data.payment_method}).",
    )
    act = Activity(
        user_id=current_user.id,
        action="payment",
        description=f"Paiement de {pay_amount:,} FCFA enregistré ({data.payment_method})",
    )
    db.add_all([notif, act])
    db.commit()
    db.refresh(payment)
    return payment
