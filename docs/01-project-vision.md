# 01 — Project Vision & Core Principles

## Executive Overview
**Moneto** is an enterprise-grade, security-first personal finance platform engineered to give individuals total sovereignty, visibility, and control over their monetary assets, liabilities, recurring commitments, and peer-to-peer lending transactions.

---

## 🎯 Target Audience
- **Security-Conscious Individuals**: Users demanding bank-level encryption, zero tracking, and self-hosted/private deployment capabilities.
- **Multi-Account Managers**: Users managing personal accounts, family commitments, and peer lending.
- **Mobile-First Professionals**: Users requiring instant responsiveness on touch devices with desktop power.

---

## 💎 Core Values & Pillars

```
+-----------------------------------------------------------------------+
|                            MONETO PILLARS                             |
+-------------------+-------------------+-------------------------------+
|  SECURITY FIRST   |   MOBILE FIRST    |         API DRIVEN            |
|  Argon2id + JWT   |  Touch Native UI  |  Decoupled Web/Mobile/iOS     |
+-------------------+-------------------+-------------------------------+
|   DOCKER FIRST    |   DOCS FIRST      |          GIT FIRST            |
| Containerized Stack| Enterprise Spec   | Conventional Commit Workflow  |
+-------------------+-------------------+-------------------------------+
```

### 1. Security-First
- Zero compromisation on authentication or authorization boundaries.
- Password hashing utilizing **Argon2id** (OWASP recommended winner).
- Session security powered by HTTP-only refresh token rotation.
- Fine-grained role and ownership checks on every API request.
- Immutable audit log trace for all sensitive mutations.

### 2. Mobile-First
- Interfaces designed from 320px screen viewports up to ultra-wide displays.
- Touch-friendly tap targets (minimum 44x44px), intuitive gesture feedback, and smooth micro-animations.
- Prepared for cross-platform wrapper compilation via Capacitor (Android & iOS).

### 3. API-First & Decoupled Architecture
- Versioned `/api/v1` backend endpoints.
- Strict request and response schemas powered by Zod.
- Complete separation between application presentation and data processing services.

### 4. Enterprise Maintainability & Docker-First
- Standardized multi-stage containerization.
- Multi-environment database configuration (`moneto_dev`, `moneto_test`, `moneto_prod`).
- Comprehensive CI/CD readiness.
