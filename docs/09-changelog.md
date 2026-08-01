# 09 — Architecture Change Protocol & Log

## Overview
This document records architectural decisions (ADRs) and systemic change logs for the Moneto platform.

---

## 🏛 Architectural Decision Records (ADRs)

### ADR-001: Selection of Argon2id for Password Security
- **Context**: Moneto requires enterprise password hashing resistant to GPU-based side-channel and brute-force attacks.
- **Decision**: Adopt `Argon2id` (winner of PHC) with `m=65536, t=3, p=4`.
- **Status**: Accepted.

### ADR-002: Dual-Token JWT Refresh Rotation Architecture
- **Context**: Need secure session management without storing persistent state in API memory for high scalability.
- **Decision**: Short-lived (15m) JWT access tokens combined with long-lived (7d) refresh tokens stored in HTTP-Only cookies with session database revocation tracking.
- **Status**: Accepted.

### ADR-003: Multi-Environment Database Separation
- **Context**: Need clean isolation between development, automated tests, and production environments.
- **Decision**: Provision isolated databases `moneto_dev`, `moneto_test`, and `moneto_prod` on PostgreSQL 16.
- **Status**: Accepted.
