# 06 — DevSecOps & Security Policy

## 🛡 Cryptographic Architecture

### 1. Password Hashing (Argon2id)
Moneto utilizes Argon2id with OWASP recommended high-security configuration:
- Memory Cost (`m`): `65536` KB (64 MB)
- Time Cost (`t`): `3` iterations
- Parallelism (`p`): `4` threads
- Salt: Cryptographically secure random 16-byte salt per user.

### 2. Dual-Token JWT Strategy & Refresh Rotation
- **Access Tokens**: Short-lived (15 minutes), signed via RSA256 or HMAC-SHA256, carrying user claims (`sub`, `email`, `role`).
- **Refresh Tokens**: Long-lived (7 days), stored in `HTTPOnly`, `SameSite=Strict`, `Secure` cookies.
- **Rotation Enforcement**: Whenever a refresh token is presented, a new token pair is generated and the previous refresh token is instantly invalidated in `user_sessions`. If a revoked refresh token is reused, all active sessions for that user account are forcibly revoked (Reuse Detection).

---

## 🔒 Defense-in-Depth & Hardening Measures

1. **Helmet Security Stack**:
   - `Content-Security-Policy`: Restricts unauthorized script execution.
   - `Strict-Transport-Security`: Enforces HSTS for 1 year (`maxAge=31536000`).
   - `X-Frame-Options`: Set to `DENY` to eliminate clickjacking.
   - `X-Content-Type-Options`: Set to `nosniff`.
   - `Referrer-Policy`: Set to `no-referrer-when-downgrade`.

2. **Request ID Correlation**:
   - Unique UUID v4 generated or propagated on every HTTP lifecycle (`X-Request-ID` and `X-Correlation-ID`).

3. **Rate Limiting**:
   - Sensitive auth endpoints (`/auth/login`, `/auth/register`) limited to 5 requests per minute per IP address.
   - General API endpoints limited to 100 requests per 15-minute window.

4. **Database Audit Logging**:
   - Every state-mutating HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) writes a structured entry to `audit_logs` capturing user ID, IP address, correlation ID, user-agent, target endpoint, and execution timestamp.

5. **Security Audit Document**:
   - Exhaustive DevSecOps security review available at [docs/SECURITY_REVIEW.md](SECURITY_REVIEW.md).
