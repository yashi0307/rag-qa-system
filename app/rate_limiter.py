import time

requests_log = {}
LIMIT = 20
WINDOW = 60


def check_rate_limit(ip: str) -> bool:
    now = time.time()
    if ip not in requests_log:
        requests_log[ip] = []
    requests_log[ip] = [t for t in requests_log[ip] if now - t < WINDOW]
    if len(requests_log[ip]) >= LIMIT:
        return False
    requests_log[ip].append(now)
    return True