# 02 — Product Roadmap & Execution Strategy

## Phase 0: Foundation & Infrastructure (Completed)
- [x] Monorepo structure initialization (`backend/`, `frontend/`, `database/`, `docker/`, `nginx/`, `scripts/`, `docs/`)
- [x] Multi-environment database schema DDL (`moneto_dev`, `moneto_test`, `moneto_prod`)
- [x] Express + TypeScript security-first API skeleton with Argon2id and JWT rotation setup
- [x] React + Vite + Tailwind CSS mobile-first web app foundation
- [x] Production & Development Docker Compose orchestrators with Nginx reverse proxy
- [x] Cross-platform management scripts (`init`, `backup`, `restore`, `healthcheck`)
- [x] GitHub Actions CI workflow pipeline

---

## Phase 1: Authentication & User Governance (Next)
- [ ] User registration, login, logout, and token refresh endpoints
- [ ] Argon2id password hashing & salt generation
- [ ] Active session revocation & user agent tracking
- [ ] Security profile management & password change workflow
- [ ] Frontend Auth Provider, login/register views, and protected route wrapper

---

## Phase 2: Category & Transaction Engine
- [ ] Category hierarchy management (Income, Expense, Transfer, Custom Icons)
- [ ] Multi-currency transaction logging with UTC timestamps
- [ ] Transaction filtering, search, pagination, and CSV export
- [ ] Soft deletion & recovery mechanisms

---

## Phase 3: Payables & Peer Lending System
- [ ] Bill & payable tracking with due date reminders and payment logs
- [ ] Peer-to-peer lend/borrow request lifecycle management
- [ ] Partial and full repayment recording with audit log verification

---

## Phase 4: Analytics & Dashboard Intelligence
- [ ] Interactive cash flow charts (TanStack / Recharts)
- [ ] Monthly budget tracking and category spending thresholds
- [ ] Net worth aggregator widget

---

## Phase 5: Mobile Packaging & Native Deployment
- [ ] Capacitor integration for Android build (.apk / .aab)
- [ ] iOS Xcode project configuration
- [ ] Push notification service integration
