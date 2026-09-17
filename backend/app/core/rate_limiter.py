import time
import threading
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Lightweight sliding-window in-memory rate limiter.
    Provides protection against credential stuffing, brute force, and API flooding
    without external dependencies (Redis/Memcached).
    """
    def __init__(self, requests_limit: int = 10, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.records = defaultdict(list)
        self.lock = threading.Lock()
        self._last_cleanup = time.time()

    def _cleanup_expired(self, now: float):
        # Periodically purge keys that have no timestamps in the current window
        if now - self._last_cleanup > 300:  # Every 5 minutes
            keys_to_delete = []
            for ip, timestamps in self.records.items():
                active = [t for t in timestamps if now - t < self.window_seconds]
                if not active:
                    keys_to_delete.append(ip)
                else:
                    self.records[ip] = active
            for k in keys_to_delete:
                del self.records[k]
            self._last_cleanup = now

    def __call__(self, request: Request):
        # Extract client IP, taking into account X-Forwarded-For if behind a proxy
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        elif request.client:
            client_ip = request.client.host
        else:
            client_ip = "127.0.0.1"

        now = time.time()
        endpoint_key = f"{client_ip}:{request.url.path}"

        with self.lock:
            self._cleanup_expired(now)
            # Filter timestamps to the active sliding window
            timestamps = [t for t in self.records[endpoint_key] if now - t < self.window_seconds]
            
            if len(timestamps) >= self.requests_limit:
                retry_after = int(self.window_seconds - (now - timestamps[0]))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Trop de requêtes. Veuillez patienter avant de réessayer.",
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            timestamps.append(now)
            self.records[endpoint_key] = timestamps

# Pre-configured rate limiters for sensitive endpoints
auth_login_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)      # 10 attempts per minute
auth_register_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)     # 5 registrations per minute
auth_forgot_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=300)      # 5 requests per 5 minutes
