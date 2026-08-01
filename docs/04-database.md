# 04 — Database Schema & Data Governance

## Database Environments
Moneto uses three isolated database instances:
- `moneto_dev`: Used for local feature development and hot-reloading.
- `moneto_test`: Isolated database for running unit and integration testing suites without side effects.
- `moneto_prod`: Production database with strict backup and access policies.

---

## 🗄 Entity Relationship Model & Table Specifications

The database schema consists of **12 core enterprise tables**:

```text
users ──< user_sessions
users ──< user_settings
users ──< categories ──< transactions
users ──< payables ──< payable_payments
users ──< lend_requests ──< lend_transactions
users ──< notifications
users ──< audit_logs
users ──< connections
```

### Table Definitions Overview

1. `users`: Master user account records (UUID PK, email, password_hash, status, timestamps).
2. `user_sessions`: Active user authentication sessions (refresh tokens, IP, user-agent, expires_at, revoked_at).
3. `categories`: Income and expense categorization taxonomy (custom icons, types, system vs custom flag).
4. `transactions`: Immutable financial transaction history (amount, type, category_id, date, soft-delete).
5. `payables`: Recurring bills and liability commitments (vendor, amount, due_date, status).
6. `payable_payments`: Payment executions against logged payables.
7. `lend_requests`: Peer-to-peer lending and borrowing records (counterparty, principal, interest, status).
8. `lend_transactions`: Repayment transactions linked to lend requests.
9. `user_settings`: User preference storage (theme, default currency, notification rules, MFA status).
10. `notifications`: In-app system alerts, security warnings, and payable reminders.
11. `audit_logs`: Immutable security audit log storing IP, user_id, action, resource, and payload diffs.
12. `connections`: Third-party financial institution connection tokens and metadata.

---

## 🔒 Data Integrity & Soft Deletes
- Primary Keys: All tables use `UUIDv4` generated via PostgreSQL `uuid_generate_v4()` to eliminate ID enumeration attacks.
- Timestamps: All temporal fields are stored in `TIMESTAMPTZ` (UTC).
- Soft Deletions: Tables with financial significance contain `deleted_at TIMESTAMPTZ DEFAULT NULL`. Hard deletes are strictly prohibited on core transactional ledgers.
