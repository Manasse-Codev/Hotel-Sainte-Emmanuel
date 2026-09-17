from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.room import Room
from ..schemas.room import RoomOut

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("", response_model=list[RoomOut])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

@router.get("/{id}", response_model=RoomOut)
def get_room(id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chambre non trouvée",
        )
    return room
