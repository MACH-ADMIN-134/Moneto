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

## 🔒 Defense-in-Depth Measures

1. **Helmet HTTP Headers**:
   - `Content-Security-Policy`: Restricts unauthorized script execution.
   - `Strict-Transport-Security`: Enforces HSTS for 1 year.
   - `X-Frame-Options`: Set to `DENY` to eliminate clickjacking.
   - `X-Content-Type-Options`: Set to `nosniff`.

2. **Rate Limiting**:
   - Sensitive auth endpoints (`/auth/login`, `/auth/register`) limited to 5 requests per minute per IP address.
   - General API endpoints limited to 100 requests per 15-minute window.

3. **Database Audit Logging**:
   - Every state-mutating HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) writes an entry to `audit_logs` capturing user ID, IP address, user-agent, target endpoint, and execution timestamp.

4. **Non-Root Container Execution**:
   - All Docker images drop root privileges and execute as dedicated non-root OS users (`node` / `nginx`).
