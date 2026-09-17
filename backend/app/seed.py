import json
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from .models.user import User
from .models.room import Room
from .models.reservation import Reservation
from .models.payment import Payment
from .models.review import Review
from .models.notification import Notification
from .models.activity import Activity
from .models.setting import Setting
from .core.security import hash_password

def seed_database(db: Session):
    # 1. Create Admin User if not exists
    admin = db.query(User).filter(User.email == "admin@hotel-sainte-emmanuelle.ci").first()
    if not admin:
        admin = User(
            first_name="Admin",
            last_name="HSE",
            email="admin@hotel-sainte-emmanuelle.ci",
            phone="+225 07 00 00 00 00",
            password_hash=hash_password("admin1234"),
            role="admin",
            loyalty_tier="gold",
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Create Demo Client if not exists
    client = db.query(User).filter(User.email == "client@hotel-sainte-emmanuelle.ci").first()
    if not client:
        client = User(
            first_name="Jean",
            last_name="Kouassi",
            email="client@hotel-sainte-emmanuelle.ci",
            phone="+225 07 08 09 10 11",
            password_hash=hash_password("client1234"),
            role="client",
            loyalty_tier="gold",
            is_verified=True,
        )
        db.add(client)
        db.commit()
        db.refresh(client)

    # 3. Seed Rooms
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
                "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCJoQSDojDpleayH2WQZBgkwooY9dc1Rte2Fe9h5WPzLfIA-CSphbT-8bjgvvGCQqh9PwXt4SzQWaYNojiNfT-Mg0hWgIKr48wOMXcl4a8h1hgzuQ_vj4dRNyEkTpvgEHpIKyaXayzfDpPKHpkp5dy2uSdhoWULpwN2YAoY_5oD_QIlxOEhbL_f0tZ0T1BqYwjXOPcdeF8Wsf-VI6cjWjAoUceuedFu8MMB8ch1mV5fDohfD1-f3AhhgtAfLI71wkiZRg",
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
                "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDbY1diafG7i1cEKjlLetLKJ4sclhwTHx3sGhFY4LKuGWkabIO8keGeO_8XLs6SyOGjHwu_OZiG6wEKxuckBkkFysE0AFvBSOFfqLvY6fOcuitQ_vtnlHQpMfbB-U4A7QXFF0m0JXwV8hf8Au6klEG_LybkN67nb5o62DN0r2loKLBzjpUkxE7FGwS4CToJbWIfixkrKTPxyz3FZicoL5zDgxZPuRH8SNPHqQrYjndyrYTBIm7iCXXCyytNaYCHmDI46A",
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
                "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDwwGFlGM5XSjCCjZEtIZKTzVfQZgn8qW0t9RFolTZ8jxXxk6A4xJ3r5sVxNKqdXHnwq5IXps0-Z7M05WsjJROgaOgIGUyhM3AbtXxU4-D--b0xPTdtl-M1LDkDJsHn5otd8cERbCqpc0pp6DOCfEyz29ahZHmwmiWCArr3SsiV0aNKuF3XbGPZkMQPerdCkBHtMYOHaiFXggRJkJ_90LZavXYEpGLFhx20ryzTqRkCW2mQqMrXaZobJgg9Zxpekf2TWw",
                "status": "available",
            },
        ]
        for r_data in rooms_data:
            room = Room(**r_data)
            db.add(room)
        db.commit()

    # 4. Seed Initial Reservations for Client & Demo
    if db.query(Reservation).count() == 0 and client:
        today = date.today()
        res1 = Reservation(
            id="SE-8921",
            user_id=client.id,
            room_id="deluxe",
            guest_name="Jean Kouassi",
            phone=client.phone,
            check_in=today + timedelta(days=5),
            check_out=today + timedelta(days=8),
            guests=2,
            total_amount=225000,
            status="confirmed",
            special_requests="Arrivée tardive vers 20h. Bouteille d'eau fraîche en chambre.",
        )
        res2 = Reservation(
            id="SE-8918",
            user_id=client.id,
            room_id="superieure",
            guest_name="Jean Kouassi",
            phone=client.phone,
            check_in=today - timedelta(days=20),
            check_out=today - timedelta(days=17),
            guests=1,
            total_amount=165000,
            status="completed",
            special_requests="Chambre au calme demandée.",
        )
        db.add_all([res1, res2])
        db.commit()

        # Seed Payments
        pay1 = Payment(
            id="PAY-2025-041",
            reservation_id="SE-8921",
            user_id=client.id,
            amount=225000,
            status="validated",
            payment_method="Wave",
            transaction_reference="WAVE-CI-984210",
        )
        pay2 = Payment(
            id="PAY-2025-038",
            reservation_id="SE-8918",
            user_id=client.id,
            amount=165000,
            status="validated",
            payment_method="Orange Money",
            transaction_reference="OM-CI-773412",
        )
        db.add_all([pay1, pay2])

        # Seed Reviews
        rev = Review(
            user_id=client.id,
            reservation_id="SE-8918",
            rating=5,
            comment="Un accueil remarquable à Soubré ! La literie est d'un confort irréprochable et le personnel d'une délicatesse rare.",
            status="approved",
        )
        db.add(rev)

        # Seed Notifications
        notif1 = Notification(
            user_id=client.id,
            title="Réservation confirmée",
            message="Votre séjour en Suite Deluxe du 22 au 25 Octobre 2025 est validé. Réf : SE-8921.",
            is_read=False,
        )
        notif2 = Notification(
            user_id=client.id,
            title="Paiement validé",
            message="Votre paiement Wave de 225 000 FCFA a bien été enregistré avec succès.",
            is_read=True,
        )
        db.add_all([notif1, notif2])

        # Seed Activities
        act1 = Activity(
            user_id=client.id,
            action="reservation",
            description="Réservation confirmée pour la Suite Deluxe (SE-8921)",
        )
        act2 = Activity(
            user_id=client.id,
            action="payment",
            description="Paiement de 225 000 FCFA validé via Wave",
        )
        db.add_all([act1, act2])

        db.commit()

    # 5. Seed Hotel Settings
    default_settings = {
        "hotel_name": "Hôtel Sainte Emmanuelle",
        "city": "Soubré, Côte d'Ivoire",
        "region": "Région de la Nawa",
        "address": "Quartier Nabouhi, non loin de l'EPP Nabouhi",
        "phone": "+225 07 07 12 34 56",
        "whatsapp": "+225 05 05 98 76 54",
        "email": "contact@hotel-sainte-emmanuelle.ci",
        "checkin_time": "14:00",
        "checkout_time": "12:00",
        "currency": "FCFA",
    }
    for k, v in default_settings.items():
        if not db.query(Setting).filter(Setting.key == k).first():
            db.add(Setting(key=k, value=v))
    db.commit()
