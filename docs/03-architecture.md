# 03 — Technical Architecture & System Topology

## System Diagram

```text
                               +----------------------------------------+
                               |              CLIENT APP                |
                               |  React SPA / Mobile (Capacitor)        |
                               +-------------------+--------------------+
                                                   |
                                           HTTPS / REST (/api/v1)
                                                   |
                                                   v
                               +-------------------+--------------------+
                               |          NGINX REVERSE PROXY          |
                               |   Rate Limiting | SSL | Security Headers|
                               +-------------------+--------------------+
                                                   |
                                                   v
                               +-------------------+--------------------+
                               |         MONETO EXPRESS BACKEND         |
                               |  Middleware: Helmet, Cors, Auth, Audit  |
                               |  Modules: Auth, Users, Tx, Payables    |
                               +-------------------+--------------------+
                                                   |
                                                   v
                               +-------------------+--------------------+
                               |         POSTGRESQL DATABASE            |
                               |  (moneto_dev / moneto_test / prod)    |
                               +----------------------------------------+
```

---

## 🏛 Layered Architecture Principles

### 1. Presentation Layer (Nginx & React SPA)
- Nginx serves static production assets and acts as single ingress point on port 80/443.
- Proxies `/api/v1/*` requests directly to backend container `http://backend:5000`.
- Implements HTTP Strict Transport Security (HSTS), Content Security Policy (CSP), and request rate limits.

### 2. Application Layer (Express + TypeScript API)
- **Controller-Service-Repository Pattern**:
  - `Routes`: Map endpoints to HTTP methods and attach validation/auth middleware.
  - `Controllers`: Handle request/response translation and standard HTTP status code return.
  - `Services`: Encapsulate business logic, database queries, and transaction state.
  - `Schemas`: Zod validation definitions for incoming request bodies, params, and queries.

### 3. Security & Middleware Pipeline
1. **Helmet Middleware**: Inject defensive security headers.
2. **CORS Middleware**: Strict white-listing of approved client origin URLs.
3. **Rate Limiting**: Prevent brute-force attacks on sensitive auth routes.
4. **Audit Middleware**: Log request metadata into `audit_logs` table asynchronously.
5. **Auth Middleware**: Validate Bearer JWT tokens and verify session status.
6. **Error Handler**: Catch runtime exceptions and format standardized JSON error responses.

### 4. Data Layer (PostgreSQL)
- Enterprise relational model utilizing strictly typed columns, foreign keys with explicit cascade/restrict behaviors, composite indexing on high-frequency query parameters (e.g. `user_id, transaction_date`), and soft deletion (`deleted_at`).
