import urllib.request
import json
import time
from datetime import date, timedelta
import random

BASE_URL = "http://127.0.0.1:8000"

def request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"detail": content}

def run_sync_test():
    print("\n=======================================================")
    print("🚀 SCÉNARIO DE TEST DE BOUT EN BOUT — SYNCHRO CLIENT ↔ ADMIN")
    print("=======================================================\n")

    # Étape 1 : Créer un compte client
    timestamp = int(time.time())
    client_email = f"client_sync_{timestamp}@hotel.ci"
    client_pass = "ClientPass123!"
    client_first = "Amadou"
    client_last = "Diallo"
    client_phone = "+225 07 44 55 66 77"

    status, reg_res = request("POST", "/api/auth/register", {
        "first_name": client_first,
        "last_name": client_last,
        "email": client_email,
        "password": client_pass,
        "phone": client_phone,
    })
    assert status == 200, f"Étape 1 échouée (Registration): {reg_res}"
    print(f"✓ Étape 1 : Compte client créé avec succès ({client_email})")

    # Étape 2 : Se connecter en tant que client
    status, login_res = request("POST", "/api/auth/login", {
        "email": client_email,
        "password": client_pass,
    })
    assert status == 200 and "access_token" in login_res, f"Étape 2 échouée (Login client): {login_res}"
    client_token = login_res["access_token"]
    print(f"✓ Étape 2 : Connexion client réussie (Token JWT reçu pour {login_res['user']['first_name']})")

    # Étape 3 : Effectuer une réservation depuis le site public
    offset = random.randint(10, 180)
    d_in = (date.today() + timedelta(days=offset)).isoformat()
    d_out = (date.today() + timedelta(days=offset + 3)).isoformat()
    room_id = "standard"

    status, booking = request("POST", "/api/reservations", {
        "room_id": room_id,
        "guest_name": f"{client_first} {client_last}",
        "phone": client_phone,
        "check_in": d_in,
        "check_out": d_out,
        "guests": 2,
        "special_requests": "Arrivée prévue en fin d'après-midi",
    }, token=client_token)
    assert status == 200 and booking["status"] == "pending", f"Étape 3 échouée (Réservation statut initial): {booking}"
    booking_id = booking["id"]
    total_amount = booking["total_amount"]
    print(f"✓ Étape 3 : Réservation {booking_id} créée avec succès depuis le site public (Montant: {total_amount:,} FCFA, Statut: '{booking['status']}')")

    # Étape 4 : Vérifier que la réservation est enregistrée dans SQLite
    from app.database import SessionLocal
    from app.models.reservation import Reservation
    db = SessionLocal()
    db_res = db.query(Reservation).filter(Reservation.id == booking_id).first()
    assert db_res is not None, f"Étape 4 échouée: Réservation {booking_id} non trouvée dans SQLite"
    assert db_res.status == "pending", f"Étape 4 échouée: statut SQLite attendu 'pending', reçu '{db_res.status}'"
    db.close()
    print(f"✓ Étape 4 : Vérification SQLite directe confirmée (ID: {db_res.id}, Statut: {db_res.status})")

    # Étape 5 : Se connecter à l'administration avec le compte admin
    admin_email = "admin@hotel-sainte-emmanuelle.ci"
    admin_pass = "admin1234"
    status, admin_login = request("POST", "/api/auth/login", {
        "email": admin_email,
        "password": admin_pass,
    })
    assert status == 200 and admin_login["user"]["role"] == "admin", f"Étape 5 échouée: {admin_login}"
    admin_token = admin_login["access_token"]
    print(f"✓ Étape 5 : Connexion à l'Espace Administrateur réussie ({admin_email}, rôle: {admin_login['user']['role']})")

    # Étape 6 : Vérifier que la réservation créée par le client apparaît dans l'admin
    status, admin_reservations = request("GET", "/api/admin/reservations", token=admin_token)
    assert status == 200, f"Étape 6 échouée (Listing admin): {admin_reservations}"
    matched = [r for r in admin_reservations if r["id"] == booking_id]
    assert len(matched) == 1, f"Étape 6 échouée: Réservation {booking_id} non trouvée dans la liste admin"
    admin_view_res = matched[0]
    assert admin_view_res["status"] == "pending", f"Statut dans l'admin attendu 'pending', reçu '{admin_view_res['status']}'"
    print(f"✓ Étape 6 : La réservation {booking_id} apparaît bien dans l'Espace Administrateur (Client: {admin_view_res['guest_name']}, Statut: '{admin_view_res['status']}')")

    # Étape 7 : L'admin confirme la réservation
    status, updated_res = request("PATCH", f"/api/admin/reservations/{booking_id}/status", {
        "status": "confirmed"
    }, token=admin_token)
    assert status == 200 and updated_res["status"] == "confirmed", f"Étape 7 échouée (Confirmation admin): {updated_res}"
    print(f"✓ Étape 7 : L'administrateur confirme la réservation {booking_id} via PATCH /api/admin/reservations/{booking_id}/status")

    # Étape 8 : Vérifier que SQLite contient status = confirmed
    db = SessionLocal()
    db_res_updated = db.query(Reservation).filter(Reservation.id == booking_id).first()
    assert db_res_updated is not None and db_res_updated.status == "confirmed", f"Étape 8 échouée: Statut SQLite '{db_res_updated.status}'"
    db.close()
    print(f"✓ Étape 8 : Vérification SQLite réussie — status = '{db_res_updated.status}' dans la table reservations")

    # Étape 9 & 10 : Retourner dans l'espace client & vérifier que le statut est "confirmed"
    status, my_reservations = request("GET", "/api/reservations/my", token=client_token)
    assert status == 200, f"Étape 9 échouée (GET /api/reservations/my): {my_reservations}"
    client_matched = [r for r in my_reservations if r["id"] == booking_id]
    assert len(client_matched) == 1, f"Réservation {booking_id} introuvable côté client"
    client_res_obj = client_matched[0]
    assert client_res_obj["status"] == "confirmed", f"Étape 10 échouée: statut côté client '{client_res_obj['status']}'"
    print(f"✓ Étape 9 & 10 : L'espace client reflète immédiatement le statut mis à jour : '{client_res_obj['status']}' (Confirmée)")

    # Étape 11 : Vérifier que le client a reçu la notification dans SQLite et via l'API
    status, notifs = request("GET", "/api/notifications/my", token=client_token)
    assert status == 200 and len(notifs) >= 2, f"Étape 11 échouée (Notifications client): {notifs}"
    confirm_notif = next((n for n in notifs if "confirmée" in n["title"].lower() or "confirmée" in n["message"].lower()), None)
    assert confirm_notif is not None, f"Étape 11 échouée: Aucune notification de confirmation trouvée : {notifs}"
    print(f"✓ Étape 11 : Notification bien reçue par le client dans son espace : \"{confirm_notif['title']} — {confirm_notif['message']}\"")

    # Bonus : Vérifier la piste d'audit dans les activités
    status, acts = request("GET", "/api/activities/my", token=client_token)
    assert status == 200 and len(acts) >= 2, f"Activités client: {acts}"
    print(f"✓ Bonus Traçabilité : Historique d'activité enregistré ({len(acts)} entrées)")

    print("\n=======================================================")
    print("🏆 LES 11 ÉTAPES DU SCÉNARIO RÉEL ONT TOUTES ÉTÉ VALIDÉES !")
    print("=======================================================\n")

if __name__ == "__main__":
    run_sync_test()
