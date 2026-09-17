import urllib.request
import urllib.parse
import json
import sys

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

def run_e2e():
    print("=== STARTING FULL E2E VALIDATION ===")
    
    # 1. Health check
    status, res = request("GET", "/api/health")
    assert status == 200, f"Health check failed: {status}"
    print("✓ 1. Backend health check passed")

    # 2. Public Rooms
    status, rooms = request("GET", "/api/rooms")
    assert status == 200 and len(rooms) >= 3, f"Failed getting rooms: {rooms}"
    room_id = rooms[0]["id"]
    print(f"✓ 2. Public rooms retrieved ({len(rooms)} rooms, tested id {room_id})")

    # 3. Public Reviews
    status, reviews = request("GET", "/api/reviews")
    assert status == 200, f"Failed getting reviews: {reviews}"
    print(f"✓ 3. Public reviews retrieved ({len(reviews)} reviews)")

    # 4. Register new client
    import time
    test_email = f"test_{int(time.time())}@client.com"
    status, reg_res = request("POST", "/api/auth/register", {
        "first_name": "E2E",
        "last_name": "User",
        "email": test_email,
        "password": "Password123!",
        "phone": "+225 01 02 03 04 05"
    })
    assert status == 200, f"Registration failed: {reg_res}"
    client_token = reg_res["access_token"]
    print(f"✓ 4. Client registered successfully ({test_email})")

    # 5. Client Profile /me
    status, me = request("GET", "/api/auth/me", token=client_token)
    assert status == 200 and me["email"] == test_email and me["role"] == "client", f"Me failed: {me}"
    print("✓ 5. Client /me profile retrieved")

    # 6. Check Room Availability
    from datetime import date, timedelta
    import random
    offset = random.randint(30, 200)
    d_in = (date.today() + timedelta(days=offset)).isoformat()
    d_out = (date.today() + timedelta(days=offset + 4)).isoformat()
    d_conflict_in = (date.today() + timedelta(days=offset + 2)).isoformat()
    d_conflict_out = (date.today() + timedelta(days=offset + 6)).isoformat()

    status, avail = request("POST", "/api/reservations/check-availability", {
        "room_id": room_id,
        "check_in": d_in,
        "check_out": d_out
    })
    assert status == 200 and avail["available"] is True, f"Availability failed: {avail}"
    print("✓ 6. Room availability check passed (available)")

    # 7. Create Reservation
    status, booking = request("POST", "/api/reservations", {
        "room_id": room_id,
        "guest_name": "E2E Test User",
        "phone": "+225 01 02 03 04 05",
        "check_in": d_in,
        "check_out": d_out,
        "guests": 2,
        "special_requests": "Vue sur le jardin si possible"
    }, token=client_token)
    assert status == 200 and booking["status"] == "confirmed", f"Booking failed: {booking}"
    booking_id = booking["id"]
    total_price = booking["total_amount"]
    print(f"✓ 7. Reservation created successfully (ID: {booking_id}, Total: {total_price} FCFA)")

    # 8. Check Overlap availability (Should now be false)
    status, avail_conflict = request("POST", "/api/reservations/check-availability", {
        "room_id": room_id,
        "check_in": d_conflict_in,
        "check_out": d_conflict_out
    })
    assert status == 200 and avail_conflict["available"] is False, f"Expected conflict: {avail_conflict}"
    print("✓ 8. Availability overlap detection confirmed (room unavailable for conflicting dates)")

    # 9. Verify Client Space endpoints
    status, my_res = request("GET", "/api/reservations/my", token=client_token)
    assert status == 200 and len(my_res) >= 1, f"My reservations failed: {my_res}"
    
    status, notifs = request("GET", "/api/notifications/my", token=client_token)
    assert status == 200 and len(notifs) >= 1, f"My notifications failed: {notifs}"
    notif_id = notifs[0]["id"]
    
    status, _ = request("PATCH", f"/api/notifications/{notif_id}/read", token=client_token)
    assert status == 200, "Mark notification read failed"

    status, acts = request("GET", "/api/activities/my", token=client_token)
    assert status == 200 and len(acts) >= 1, f"My activity failed: {acts}"
    print("✓ 9. Client Space tabs verified (Reservations, Notifications, Activities)")

    # 10. Process Payment for Reservation
    status, pay = request("POST", "/api/payments", {
        "reservation_id": booking_id,
        "amount": total_price,
        "payment_method": "Orange Money",
        "reference": f"OM-E2E-{booking_id}"
    }, token=client_token)
    assert status == 200 and pay["status"] == "validated", f"Payment failed: {pay}"
    print("✓ 10. Client payment recorded and validated")

    # 11. Submit a Client Review
    status, rev = request("POST", "/api/reviews", {
        "room_id": room_id,
        "rating": 5,
        "comment": "Séjour inoubliable au Sainte Emmanuelle, service remarquable !"
    }, token=client_token)
    assert status == 200, f"Review failed: {rev}"
    print("✓ 11. Client review submitted for moderation")

    # 12. Security Test: regular client attempts Admin endpoint -> 403 Forbidden
    status, forbidden = request("GET", "/api/admin/kpis", token=client_token)
    assert status == 403, f"Security breach! Client accessed admin kpis: {status}"
    print("✓ 12. Security verified: Client rejected with 403 from Admin API")

    # 13. Admin Login
    status, admin_auth = request("POST", "/api/auth/login", {
        "email": "admin@hotel-sainte-emmanuelle.ci",
        "password": "admin1234"
    })
    assert status == 200 and admin_auth["user"]["role"] == "admin", f"Admin login failed: {admin_auth}"
    admin_token = admin_auth["access_token"]
    print("✓ 13. Admin authentication successful")

    # 14. Admin KPIs
    status, kpis = request("GET", "/api/admin/kpis", token=admin_token)
    assert status == 200 and "total_rooms" in kpis and "monthly_revenue" in kpis, f"Admin KPIs failed: {kpis}"
    print(f"✓ 14. Admin KPIs retrieved: {kpis}")

    # 15. Admin View & Update Reservation
    status, admin_bookings = request("GET", "/api/admin/reservations", token=admin_token)
    assert status == 200 and any(b["id"] == booking_id for b in admin_bookings), "Booking not listed in Admin"
    status, updated_booking = request("PATCH", f"/api/admin/reservations/{booking_id}/status", {"status": "completed"}, token=admin_token)
    assert status == 200 and updated_booking["status"] == "completed", f"Update booking failed: {updated_booking}"
    print(f"✓ 15. Admin updated reservation {booking_id} status to 'completed'")

    # 16. Admin Moderate Reviews
    status, admin_reviews = request("GET", "/api/admin/reviews", token=admin_token)
    assert status == 200, f"Admin reviews failed: {admin_reviews}"
    pending_rev = [r for r in admin_reviews if r["status"] == "pending"]
    if pending_rev:
        status, app_rev = request("PATCH", f"/api/admin/reviews/{pending_rev[0]['id']}/status", {"status": "approved"}, token=admin_token)
        assert status == 200 and app_rev["status"] == "approved"
        print(f"✓ 16. Admin approved review ID {pending_rev[0]['id']}")

    # 17. Admin Update Hotel Settings
    status, settings = request("GET", "/api/admin/settings", token=admin_token)
    assert status == 200, f"Settings fetch failed: {settings}"
    status, updated_settings = request("PUT", "/api/admin/settings", {
        "hotel_name": "Hôtel Sainte Emmanuelle",
        "phone": "+225 27 22 44 55 66",
        "email": "contact@hotel-sainte-emmanuelle.ci",
        "address": "Boulevard Lagunaire, Cocody, Abidjan",
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "currency": "FCFA",
        "tax_rate": 10.0
    }, token=admin_token)
    assert status == 200, f"Settings update failed: {updated_settings}"
    print("✓ 17. Admin updated hotel settings in SQLite")

    print("\n========================================================")
    print("🎉 ALL 17 E2E TESTS PASSED FLAWLESSLY AGAINST LIVE SQLITE!")
    print("========================================================")

if __name__ == "__main__":
    run_e2e()
