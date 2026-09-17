from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, index=True)  # e.g. "SE-8921"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    guest_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, default=1)
    total_amount = Column(Integer, nullable=False)
    status = Column(String, default="pending")  # "pending", "confirmed", "completed", "cancelled"
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")
    payments = relationship("Payment", back_populates="reservation", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="reservation")
