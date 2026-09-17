import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation
from app.models.payment import Payment
from app.core.security import verify_password, create_access_token, decode_token

def test_system():
    print("1. Creating database tables...")
    Base.metadata.create_all(bind=engine)

    print("2. Seeding database...")
    db = SessionLocal()
    try:
        seed_database(db)

        # Verify Admin
        admin = db.query(User).filter(User.email == "admin@hotel-sainte-emmanuelle.ci").first()
        assert admin is not None, "Admin not found!"
        assert admin.role == "admin", "Admin role incorrect!"
        assert verify_password("admin1234", admin.password_hash), "Admin password verification failed!"
        print(f"   ✓ Admin verified: {admin.email} (Role: {admin.role})")

        # Verify Demo Client
        client = db.query(User).filter(User.email == "client@hotel-sainte-emmanuelle.ci").first()
        assert client is not None, "Client not found!"
        assert verify_password("client1234", client.password_hash), "Client password verification failed!"
        print(f"   ✓ Client verified: {client.first_name} {client.last_name} ({client.email})")

        # Verify Rooms
        rooms = db.query(Room).all()
        assert len(rooms) >= 3, f"Expected 3 rooms, found {len(rooms)}"
        for r in rooms:
            print(f"   ✓ Room: {r.name} - {r.price_display} (Status: {r.status})")

        # Verify Reservations
        reservations = db.query(Reservation).all()
        assert len(reservations) >= 2, f"Expected >= 2 reservations, found {len(reservations)}"
        for res in reservations:
            print(f"   ✓ Reservation: {res.id} ({res.guest_name}) - {res.total_amount:,} FCFA - Status: {res.status}")

        # Verify Token creation & decoding
        token = create_access_token({"sub": str(client.id), "role": client.role})
        payload = decode_token(token)
        assert payload is not None and payload["sub"] == str(client.id)
        print("   ✓ JWT token generation and validation verified")

        print("\nAll backend model, database, and security checks PASSED successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    test_system()
