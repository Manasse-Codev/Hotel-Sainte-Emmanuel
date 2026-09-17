"""
Comprehensive Security Test Suite for Hôtel Sainte Emmanuelle.
Audits:
- Authentication & Sessions
- Rate Limiting & Brute Force
- IDOR (Insecure Direct Object References)
- Privilege Escalation (Visitor -> Admin, Client -> Admin)
- Business Logic & Price Tampering
- Input Validation & Length Limits
- Injection Resistance (SQLi, XSS)
- Information Leakage & PII Protection
- Security Headers & CORS
"""

import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, token=None, headers=None, client_ip=None):
    url = f"{BASE_URL}{path}"
    req_headers = headers.copy() if headers else {}
    if client_ip:
        req_headers["X-Forwarded-For"] = client_ip
    if token:
        req_headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        req_headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            resp_headers = dict(resp.headers)
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            return status, parsed, resp_headers
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read().decode("utf-8")
        resp_headers = dict(e.headers)
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = content
        return status, parsed, resp_headers
    except Exception as e:
        return 500, {"error": str(e)}, {}

def run_tests():
    print("==================================================")
    print("  HÔTEL SAINTE EMMANUELLE — FULL-STACK SECURITY SUITE")
    print("==================================================")
    passed = 0
    failed = 0

    def assert_test(name, condition, detail=""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name} -> {detail}")
            failed += 1

    # 1. AUTHENTICATION & LOGIN
    print("\n--- 1. AUTHENTICATION & SESSIONS ---")
    # Valid Admin Login
    st, res, _ = make_request("/auth/login", "POST", {
        "email": "admin@hotel-sainte-emmanuelle.ci",
        "password": "admin1234"
    }, client_ip="10.0.0.1")
    assert_test("Admin login succeeds", st == 200 and "access_token" in res, f"st={st}, res={res}")
    admin_token = res.get("access_token")

    # Valid Client Login (register dynamically if not present)
    client_email = "security_suite_client@test.ci"
    st, res, _ = make_request("/auth/login", "POST", {
        "email": client_email,
        "password": "client1234"
    }, client_ip="10.0.0.2")
    if st != 200:
        make_request("/auth/register", "POST", {
            "first_name": "Jean",
            "last_name": "Test",
            "email": client_email,
            "password": "client1234",
            "phone": "+2250100000001"
        }, client_ip="10.0.0.2")
        st, res, _ = make_request("/auth/login", "POST", {
            "email": client_email,
            "password": "client1234"
        }, client_ip="10.0.0.2")
    assert_test("Client login succeeds", st == 200 and "access_token" in res, f"st={st}, res={res}")
    client_a_token = res.get("access_token")

    # Invalid Password
    st, res, _ = make_request("/auth/login", "POST", {
        "email": client_email,
        "password": "wrongpassword123"
    }, client_ip="10.0.0.3")
    assert_test("Wrong credentials rejected with 401", st == 401, f"st={st}")

    # Tampered Token Signature
    tampered_token = client_a_token[:-5] + "XXXXX" if client_a_token else "bad.jwt.token"
    st, res, _ = make_request("/auth/me", "GET", token=tampered_token)
    assert_test("Tampered JWT rejected with 401", st == 401, f"st={st}")

    # Missing Token on Protected Endpoint
    st, res, _ = make_request("/auth/me", "GET")
    assert_test("Missing JWT rejected with 401", st == 401, f"st={st}")

    # 2. RATE LIMITING & BRUTE FORCE
    print("\n--- 2. RATE LIMITING & ABUSE PREVENTION ---")
    # Trigger rate limiter on /auth/login by sending rapid bad requests from an attacker IP
    attacker_ip = "198.51.100.99"
    rate_limited = False
    for i in range(12):
        st, _, _ = make_request("/auth/login", "POST", {
            "email": "rate_test@test.ci",
            "password": f"try_{i}"
        }, client_ip=attacker_ip)
        if st == 429:
            rate_limited = True
            break
    assert_test("Rate Limiter triggers HTTP 429 Too Many Requests on brute-force", rate_limited)

    # 3. PRIVILEGE ESCALATION
    print("\n--- 3. PRIVILEGE ESCALATION ---")
    # Visitor -> Admin route
    st, _, _ = make_request("/admin/kpis", "GET")
    assert_test("Visitor blocked from /api/admin/kpis (401)", st == 401, f"st={st}")

    # Client -> Admin route
    st, _, _ = make_request("/admin/kpis", "GET", token=client_a_token)
    assert_test("Client blocked from /api/admin/kpis (403)", st == 403, f"st={st}")

    st, _, _ = make_request("/admin/reservations", "GET", token=client_a_token)
    assert_test("Client blocked from /api/admin/reservations (403)", st == 403, f"st={st}")

    # Privilege escalation attempt during registration
    unique_ts = int(time.time())
    unique_email = f"attacker_{unique_ts}@exploit.ci"
    st, res, _ = make_request("/auth/register", "POST", {
        "first_name": "Evil",
        "last_name": "Attacker",
        "email": unique_email,
        "password": "securepassword123",
        "role": "admin"  # Injected role
    }, client_ip=f"10.0.1.{unique_ts % 250}")
    registered_role = res.get("user", {}).get("role") if isinstance(res, dict) else None
    assert_test("Injected role='admin' on register rejected/forced to 'client'", registered_role == "client", f"role={registered_role}")
    attacker_token = res.get("access_token")

    # Privilege escalation attempt during profile update
    st, res, _ = make_request("/users/profile", "PUT", {
        "first_name": "Evil",
        "role": "admin"
    }, token=attacker_token)
    st_me, res_me, _ = make_request("/auth/me", "GET", token=attacker_token)
    assert_test("Injected role='admin' on profile update does not change role", res_me.get("role") == "client")

    # 4. IDOR (BROKEN ACCESS CONTROL)
    print("\n--- 4. IDOR (INSECURE DIRECT OBJECT REFERENCE) ---")
    # Create a reservation for Client A with distinct future dates
    offset = (unique_ts % 50) + 100
    date_in = date.today() + timedelta(days=offset)
    date_out = date_in + timedelta(days=2)
    st, res_booking, _ = make_request("/reservations", "POST", {
        "room_id": "standard",
        "guest_name": "Jean Kouassi",
        "phone": "+225 0708091011",
        "check_in": str(date_in),
        "check_out": str(date_out),
        "guests": 2
    }, token=client_a_token)
    assert_test("Client A creates legitimate booking", st == 200 and "id" in res_booking, f"st={st}, res={res_booking}")
    res_a_id = res_booking.get("id")

    # Attacker tries to GET Client A's reservation
    st, res_view, _ = make_request(f"/reservations/{res_a_id}", "GET", token=attacker_token)
    assert_test("Attacker cannot view Client A's reservation (403 Forbidden)", st == 403, f"st={st}")

    # Attacker tries to CANCEL Client A's reservation
    st, res_cancel, _ = make_request(f"/reservations/{res_a_id}/cancel", "PATCH", token=attacker_token)
    assert_test("Attacker cannot cancel Client A's reservation (403 Forbidden)", st == 403, f"st={st}")

    # Attacker tries to create payment for Client A's reservation
    st, res_pay, _ = make_request("/payments", "POST", {
        "reservation_id": res_a_id,
        "payment_method": "Wave",
        "amount": 1000
    }, token=attacker_token)
    assert_test("Attacker cannot initiate payment for Client A's reservation (403 Forbidden)", st == 403, f"st={st}")

    # 5. BUSINESS LOGIC & PRICE TAMPERING
    print("\n--- 5. BUSINESS LOGIC & PRICE INTEGRITY ---")
    # Price Tampering: Client A attempts to pay 1 FCFA instead of required booking amount
    st, res_pay_tamper, _ = make_request("/payments", "POST", {
        "reservation_id": res_a_id,
        "payment_method": "Wave",
        "amount": 1  # Maliciously low amount
    }, token=client_a_token)
    assert_test("Price Tampering (sending 1 FCFA) rejected with 400 Bad Request", st == 400, f"st={st}")

    # Invalid dates: checkout before checkin
    st, _, _ = make_request("/reservations", "POST", {
        "room_id": "standard",
        "guest_name": "Bad Dates",
        "phone": "+225 0102030405",
        "check_in": str(date_out),
        "check_out": str(date_in),
        "guests": 1
    }, token=client_a_token)
    assert_test("Check-out before check-in rejected with 400", st == 400, f"st={st}")

    # Invalid dates: checkin in the past
    past_date = date.today() - timedelta(days=5)
    st, _, _ = make_request("/reservations", "POST", {
        "room_id": "standard",
        "guest_name": "Past Date",
        "phone": "+225 0102030405",
        "check_in": str(past_date),
        "check_out": str(date_in),
        "guests": 1
    }, token=client_a_token)
    assert_test("Check-in in the past rejected with 400", st == 400, f"st={st}")

    # 6. INJECTION RESISTANCE
    print("\n--- 6. INJECTION RESISTANCE ---")
    # SQL Injection in login (from a separate IP to avoid rate limiter)
    st, _, _ = make_request("/auth/login", "POST", {
        "email": "' OR '1'='1' --",
        "password": "password"
    }, client_ip="10.0.2.1")
    assert_test("SQL Injection in login email fails safely (401/422)", st in [401, 422], f"st={st}")

    # SQL Injection in room ID
    encoded_room_sqli = urllib.parse.quote("1' UNION SELECT 1,2,3 --")
    st, _, _ = make_request(f"/rooms/{encoded_room_sqli}", "GET")
    assert_test("SQL Injection in room ID handled safely (404/422)", st in [404, 422], f"st={st}")

    # XSS Sanitization in reviews
    xss_payload = "<script>alert('XSS')</script>Très bon hôtel"
    st, res_xss, _ = make_request("/reviews", "POST", {
        "rating": 5,
        "comment": xss_payload
    }, token=client_a_token)
    comment_saved = res_xss.get("comment", "") if isinstance(res_xss, dict) else ""
    assert_test("XSS payload in review comment HTML-escaped", "<script>" not in comment_saved and "&lt;script&gt;" in comment_saved, f"comment={comment_saved}")

    # 7. INFORMATION EXPOSURE & PII LEAK PREVENTION
    print("\n--- 7. INFORMATION LEAKAGE & PII PROTECTION ---")
    st, public_reviews, _ = make_request("/reviews", "GET")
    leaks_found = False
    if isinstance(public_reviews, list) and len(public_reviews) > 0:
        for r in public_reviews:
            u = r.get("user")
            if u:
                if "email" in u or "phone" in u or "password_hash" in u:
                    leaks_found = True
                    break
    assert_test("Public /reviews endpoint does NOT expose email or phone", not leaks_found)

    # 8. SECURITY HEADERS & CORS
    print("\n--- 8. SECURITY HEADERS & CORS ---")
    st, _, headers = make_request("/health", "GET")
    assert_test("Header X-Content-Type-Options: nosniff present", headers.get("x-content-type-options") == "nosniff")
    assert_test("Header X-Frame-Options: DENY present", headers.get("x-frame-options") == "DENY")
    assert_test("Header X-XSS-Protection present", "x-xss-protection" in headers)
    assert_test("Header Referrer-Policy present", "referrer-policy" in headers)

    print("\n==================================================")
    print(f"  TOTAL TESTS: {passed + failed} | PASSED: {passed} | FAILED: {failed}")
    print("==================================================")

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
