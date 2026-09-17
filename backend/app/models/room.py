from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)  # e.g. "standard", "superieure", "deluxe"
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)  # price in FCFA, e.g. 45000
    price_display = Column(String, nullable=False)  # e.g. "45 000 FCFA"
    capacity = Column(String, nullable=False)  # e.g. "2 personnes"
    badge = Column(String, nullable=True)  # e.g. "Disponibilité Immédiate"
    badge_type = Column(String, nullable=True)  # "available", "request", "limited"
    short_desc = Column(Text, nullable=False)
    full_desc = Column(Text, nullable=False)
    amenities = Column(Text, nullable=False)  # JSON-encoded array or comma separated
    image = Column(String, nullable=False)
    status = Column(String, default="available")  # "available", "occupied", "maintenance"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reservations = relationship("Reservation", back_populates="room")
