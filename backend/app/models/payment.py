from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)  # e.g. "PAY-2025-041"
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(String, default="pending")  # "pending", "validated", "failed"
    payment_method = Column(String, default="Wave")  # "Wave", "Orange Money", "Espèces", "Carte Bancaire"
    transaction_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="payments")
    reservation = relationship("Reservation", back_populates="payments")
