import random
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.room import Room
from ..models.reservation import Reservation
from ..models.notification import Notification
from ..models.activity import Activity
from ..schemas.reservation import (
    CheckAvailabilityRequest,
    CheckAvailabilityResponse,
    ReservationCreate,
    ReservationOut,
)
from ..core.deps import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/check-availability", response_model=CheckAvailabilityResponse)
def check_availability(data: CheckAvailabilityRequest, db: Session = Depends(get_db)):
    today = date.today()
    if data.check_in < today:
        return CheckAvailabilityResponse(
            available=False,
            nights=0,
            price_per_night=0,
            total_amount=0,
            message="La date d'arrivée ne peut pas être dans le passé.",
        )

    if data.check_out <= data.check_in:
        return CheckAvailabilityResponse(
            available=False,
            nights=0,
            price_per_night=0,
            total_amount=0,
            message="La date de départ doit être postérieure à la date d'arrivée.",
        )

    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable")

    if room.status == "maintenance":
        return CheckAvailabilityResponse(
            available=False,
            nights=0,
            price_per_night=room.price,
            total_amount=0,
            message="Cette chambre est actuellement en maintenance.",
        )

    # Check overlaps with confirmed/pending bookings
    overlap = db.query(Reservation).filter(
        Reservation.room_id == data.room_id,
        Reservation.status.in_(["confirmed", "pending"]),
        Reservation.check_in < data.check_out,
        Reservation.check_out > data.check_in,
    ).first()

    nights = (data.check_out - data.check_in).days
    total_amount = nights * room.price

    if overlap:
        return CheckAvailabilityResponse(
            available=False,
            nights=nights,
            price_per_night=room.price,
            total_amount=total_amount,
            message="Cette chambre est déjà réservée pour les dates sélectionnées.",
        )

    return CheckAvailabilityResponse(
        available=True,
        nights=nights,
        price_per_night=room.price,
        total_amount=total_amount,
        message="Chambre disponible pour votre séjour.",
    )

@router.get("/my", response_model=list[ReservationOut])
def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )

@router.post("", response_model=ReservationOut)
def create_reservation(
    data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    if data.check_in < today:
        raise HTTPException(status_code=400, detail="La date d'arrivée ne peut pas être passée.")
    if data.check_out <= data.check_in:
        raise HTTPException(status_code=400, detail="La date de départ doit être après l'arrivée.")

    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chambre introuvable.")
    if room.status == "maintenance":
        raise HTTPException(status_code=400, detail="Chambre en maintenance.")

    # Collision check
    overlap = db.query(Reservation).filter(
        Reservation.room_id == data.room_id,
        Reservation.status.in_(["confirmed", "pending"]),
        Reservation.check_in < data.check_out,
        Reservation.check_out > data.check_in,
    ).first()
    if overlap:
        raise HTTPException(
            status_code=409,
            detail="Cette chambre est déjà occupée pour ces dates.",
        )

    nights = (data.check_out - data.check_in).days
    total_amount = nights * room.price

    # Generate unique ID
    res_id = f"SE-{random.randint(1000, 9999)}"
    while db.query(Reservation).filter(Reservation.id == res_id).first():
        res_id = f"SE-{random.randint(1000, 9999)}"

    reservation = Reservation(
        id=res_id,
        user_id=current_user.id,
        room_id=room.id,
        guest_name=data.guest_name.strip(),
        phone=data.phone.strip(),
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        total_amount=total_amount,
        status="confirmed",
        special_requests=data.special_requests,
    )
    db.add(reservation)

    # Notification for user
    notif = Notification(
        user_id=current_user.id,
        title="Réservation enregistrée !",
        message=f"Votre séjour ({room.name}) du {data.check_in.strftime('%d/%m/%Y')} au {data.check_out.strftime('%d/%m/%Y')} a été réservé avec succès. Référence : {res_id}.",
    )
    # Activity log
    act = Activity(
        user_id=current_user.id,
        action="reservation",
        description=f"Nouvelle réservation {res_id} pour {room.name} ({total_amount:,} FCFA)",
    )
    db.add_all([notif, act])
    db.commit()
    db.refresh(reservation)
    return reservation

@router.get("/{id}", response_model=ReservationOut)
def get_reservation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable.")
    if res.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé.")
    return res

@router.patch("/{id}/cancel", response_model=ReservationOut)
def cancel_reservation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(Reservation).filter(Reservation.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable.")
    if res.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé.")

    if res.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cette réservation est déjà annulée.")

    res.status = "cancelled"

    notif = Notification(
        user_id=res.user_id,
        title="Réservation annulée",
        message=f"Votre réservation {res.id} a été annulée.",
    )
    act = Activity(
        user_id=current_user.id,
        action="cancel_reservation",
        description=f"Annulation de la réservation {res.id}",
    )
    db.add_all([notif, act])
    db.commit()
    db.refresh(res)
    return res
