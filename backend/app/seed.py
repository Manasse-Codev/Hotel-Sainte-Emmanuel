import json
from sqlalchemy.orm import Session
from .models.user import User
from .models.room import Room
from .models.setting import Setting
from .core.security import hash_password

def seed_database(db: Session):
    """
    Production database seeding.
    Initializes only essential resources:
    1. Default Admin User (if not exists)
    2. Hotel Rooms Catalog (if not exists)
    3. Hotel Default Production Settings (if not exists)
    No demo or mock client/booking data is seeded.
    """
    # 1. Create Admin User if not exists
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

    # 2. Seed Rooms (Standard, Supérieure, Suite Deluxe)
    if db.query(Room).count() == 0:
        rooms_data = [
            {
                "id": "standard",
                "name": "Chambre Standard",
                "price": 45000,
                "price_display": "45 000 FCFA",
                "capacity": "2 personnes",
                "badge": "Disponibilité Immédiate",
                "badge_type": "available",
                "short_desc": "Une chambre chaleureuse aux finitions boisées, dotée d'une literie King Size soignée et d'une salle de bain privative.",
                "full_desc": "Conçue pour offrir quiétude et bien-être après vos déplacements dans le département de Soubré. Un refuge élégant alliant confort contemporain et chaleur ivoirienne.",
                "amenities": json.dumps([
                    "Climatisation réglable",
                    "Wi-Fi haut débit",
                    "Télévision par satellite",
                    "Salle de bain privative",
                    "Literie prestige",
                    "Espace bureau",
                ]),
                "image": "/images/room-standard.jpg",
                "status": "available",
            },
            {
                "id": "superieure",
                "name": "Chambre Supérieure",
                "price": 55000,
                "price_display": "55 000 FCFA",
                "capacity": "2 personnes",
                "badge": "Sur Demande",
                "badge_type": "request",
                "short_desc": "Une harmonie parfaite entre volume et clarté avec belle ouverture extérieure et balcon privatif.",
                "full_desc": "Idéale pour un séjour reposant avec vue dégagée. L'espace généreux, la douche italienne et le balcon privatif font de cette chambre une parenthèse de sérénité.",
                "amenities": json.dumps([
                    "Climatisation",
                    "Wi-Fi",
                    "Balcon privatif",
                    "Douche italienne",
                    "Literie premium",
                    "Télévision",
                ]),
                "image": "/images/room-superieure.jpg",
                "status": "available",
            },
            {
                "id": "deluxe",
                "name": "Suite Deluxe",
                "price": 75000,
                "price_display": "75 000 FCFA",
                "capacity": "3 personnes",
                "badge": "Dernière Disponibilité",
                "badge_type": "limited",
                "short_desc": "Salon privé raffiné, literie d'exception et prestations VIP sur-mesure pour voyageurs exigeants.",
                "full_desc": "Le sommet du raffinement de l'Hôtel Sainte Emmanuelle. Salon séparé, accueil personnalisé au champagne local, vue panoramique sur les jardins.",
                "amenities": json.dumps([
                    "Climatisation",
                    "Wi-Fi très haut débit",
                    "Salon privé",
                    "Service en chambre VIP",
                    "Lit King Size prestige",
                    "Baignoire & Douche",
                    "Mini-bar garni",
                ]),
                "image": "/images/room-deluxe.jpg",
                "status": "available",
            },
        ]
        for r_data in rooms_data:
            room = Room(**r_data)
            db.add(room)
        db.commit()
    else:
        # Migrate existing rooms from external Google URLs to high-reliability local assets
        for r in db.query(Room).all():
            if r.image and "googleusercontent" in r.image:
                if "superieure" in r.id:
                    r.image = "/images/room-superieure.jpg"
                elif "deluxe" in r.id:
                    r.image = "/images/room-deluxe.jpg"
                else:
                    r.image = "/images/room-standard.jpg"
        db.commit()

    # 3. Seed Hotel Production Settings
    default_settings = {
        "hotel_name": "Hôtel Sainte Emmanuelle",
        "city": "Soubré, Côte d'Ivoire",
        "region": "Région de la Nawa",
        "address": "Quartier Nabouhi, non loin de l'EPP Nabouhi",
        "phone": "+225 01 71 62 60 60",
        "whatsapp": "+225 01 71 62 60 60",
        "email": "contact@hotel-sainte-emmanuelle.ci",
        "checkin_time": "14:00",
        "checkout_time": "12:00",
        "currency": "FCFA",
    }
    for k, v in default_settings.items():
        existing = db.query(Setting).filter(Setting.key == k).first()
        if not existing:
            db.add(Setting(key=k, value=v))
        else:
            existing.value = v
    db.commit()
