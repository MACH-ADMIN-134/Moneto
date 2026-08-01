# Moneto Security Review & DevSecOps Audit

**Document Version**: `v1.0.0`  
**Audit Date**: 2026-08-02  
**Target Platform**: Moneto Personal Finance Monorepo  

---

## 🛡 Executive Summary

Moneto is engineered around a **Security-First** baseline designed to protect user financial ledger data from unauthorized access, credentials theft, side-channel analysis, and OWASP Top 10 vulnerabilities.

---

## 🔒 Security Control Matrix

| Category | Security Control | Technical Standard | Status |
| :--- | :--- | :--- | :---: |
| **Password Hashing** | Argon2id | Memory: 64MB (`m=65536`), Iterations: 3 (`t=3`), Threads: 4 (`p=4`) | 🟢 Verified |
| **Session Security** | Dual-Token JWT | Short-lived Access Token (15m) + HTTP-Only Refresh Token (7d) | 🟢 Verified |
| **HTTP Headers** | Helmet Security Stack | CSP, HSTS (1 year), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` | 🟢 Verified |
| **Request Correlation** | Correlation Tracking | `X-Request-ID` & `X-Correlation-ID` injected on every HTTP lifecycle | 🟢 Verified |
| **Rate Limiting** | Express Rate Limit | Auth routes: 5 req/min, Global API: 100 req/15min | 🟢 Verified |
| **Data Integrity** | PostgreSQL & Prisma | Foreign Key Constraints, UTC Timestamps, Soft Deletes (`deleted_at`) | 🟢 Verified |
| **Audit Logging** | Async Audit Middleware | State-mutating requests logged to `audit_logs` table with IP & user agent | 🟢 Verified |
| **Container Isolation** | Non-Root Container Execution | Docker containers execute as unprivileged OS user (`node` / `nginx`) | 🟢 Verified |

---

## 🔍 OWASP Top 10 Mitigation Verification

### 1. Broken Access Control (A01:2021)
- Fine-grained ownership validation on all transactional queries (`user_id = req.user.id`).
- All financial queries isolated per user context.

### 2. Cryptographic Failures (A02:2021)
- Passwords hashed using Argon2id (OWASP recommended winner). Plaintext passwords never logged or returned in API envelopes.
- JWT tokens signed with 32+ character secrets stored in environment variables.

### 3. Injection (A03:2021)
- Prepared statements enforced by Prisma ORM and `pg` parameterized queries.
- Input fields strictly validated using Zod schemas (`validateRequest` middleware).

### 4. Insecure Design (A04:2021)
- Architecture strictly decoupled into separate presentation (React SPA), API proxy (Nginx), application logic (Express API), and storage (PostgreSQL).

### 5. Security Misconfiguration (A05:2021)
- Production build drops dev dependencies.
- Detailed error stack traces suppressed in production (`env.NODE_ENV === 'production'`).
