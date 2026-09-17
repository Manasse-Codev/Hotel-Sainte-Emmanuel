import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation
from app.models.payment import Payment
from app.models.review import Review
from app.models.notification import Notification
from app.models.activity import Activity
from app.models.setting import Setting
from app.core.security import hash_password
from app.seed import seed_database

def purge_for_production():
    db = SessionLocal()
    try:
        print("--- DÉMARRAGE DU NETTOYAGE POUR LA PRODUCTION ---")

        # 1. Purge des tables transactionnelles
        p_count = db.query(Payment).delete()
        print(f"✓ Paiements supprimés : {p_count}")

        rev_count = db.query(Review).delete()
        print(f"✓ Avis supprimés : {rev_count}")

        notif_count = db.query(Notification).delete()
        print(f"✓ Notifications supprimées : {notif_count}")

        act_count = db.query(Activity).delete()
        print(f"✓ Journal d'activités vidé : {act_count}")

        res_count = db.query(Reservation).delete()
        print(f"✓ Réservations supprimées : {res_count}")

        # 2. Purge des comptes utilisateurs tests (garde uniquement admin)
        users_deleted = db.query(User).filter(User.email != "admin@hotel-sainte-emmanuelle.ci").delete()
        print(f"✓ Comptes clients/tests supprimés : {users_deleted}")

        # 3. Vérifier le compte administrateur
        admin = db.query(User).filter(User.email == "admin@hotel-sainte-emmanuelle.ci").first()
        if not admin:
            admin = User(
                first_name="Admin",
                last_name="HSE",
                email="admin@hotel-sainte-emmanuelle.ci",
                phone="+225 01 71 62 60 60",
                password_hash=hash_password("admin1234"),
                role="admin",
                loyalty_tier="gold",
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✓ Compte administrateur principal initialisé.")
        else:
            admin.phone = "+225 01 71 62 60 60"
            db.commit()
            print("✓ Compte administrateur vérifié et prêt.")

        # 4. Réinitialiser les chambres à l'état 'available'
        rooms = db.query(Room).all()
        for r in rooms:
            r.status = "available"
        db.commit()
        print(f"✓ Chambres réinitialisées à l'état disponible : {len(rooms)} chambre(s).")

        # 5. Mettre à jour les paramètres de l'hôtel
        seed_database(db)
        print("✓ Paramètres officiels de l'hôtel mis à jour (Soubré, Nawa).")

        # 6. Journaliser l'événement de mise en production
        audit_entry = Activity(
            user_id=admin.id,
            action="system_init",
            description="[PRODUCTION] Initialisation et assainissement complet de la base de données pour la mise en exploitation.",
        )
        db.add(audit_entry)
        db.commit()
        print("✓ Entrée d'audit initiale enregistrée.")

        # 7. SQLite VACUUM pour compacter la base
        with engine.connect() as conn:
            conn.exec_driver_sql("VACUUM")
            conn.commit()
        print("✓ Base SQLite compactée avec VACUUM.")

        print("\n=======================================================")
        print("🎉 BASE DE DONNÉES PRÊTE POUR LA PRODUCTION !")
        print("=======================================================")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du nettoyage : {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    purge_for_production()
