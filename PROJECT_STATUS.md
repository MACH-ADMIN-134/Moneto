# Moneto — Project Status & Sprint Tracker

**Current Phase**: Phase 0 — Foundation & Infrastructure Setup  
**Version**: `v0.1.0-alpha`  
**Last Updated**: 2026-08-02  

---

## 🟢 Status Summary

| Area | Status | Target Completion |
| :--- | :---: | :---: |
| **Monorepo Architecture** | 🟢 Complete | Phase 0 |
| **Documentation Suite (01-09)** | 🟢 Complete | Phase 0 |
| **Database Schemas & Multi-DB Isolation** | 🟢 Complete | Phase 0 |
| **Backend Express API Skeleton** | 🟢 Complete | Phase 0 |
| **Frontend React SPA Shell & UI System** | 🟢 Complete | Phase 0 |
| **Docker & Nginx Reverse Proxy** | 🟢 Complete | Phase 0 |
| **Cross-Platform Administrative Scripts** | 🟢 Complete | Phase 0 |
| **CI/CD GitHub Actions Pipeline** | 🟢 Complete | Phase 0 |
| **Auth & Security Module** | ⏳ Pending Phase 1 | Phase 1 |
| **Transactions & Payables Module** | ⏳ Pending Phase 2 | Phase 2 |

---

## 📋 Milestone Tracker

### Milestone 0: Foundation Initialization (Current)
- [x] Create monorepo directory layout (`backend`, `frontend`, `database`, `docker`, `nginx`, `scripts`, `docs`, `.github`)
- [x] Write technical documentation suite (`01-project-vision.md` through `09-changelog.md`)
- [x] Define multi-environment PostgreSQL DDL (`moneto_dev`, `moneto_test`, `moneto_prod`) with 12 core tables
- [x] Configure backend architecture (Express, TypeScript strict, Argon2id, JWT rotation, Helmet, Winston logger, audit middleware)
- [x] Configure frontend application shell (React, Vite, TypeScript, Tailwind CSS, Light/Dark/System theme provider, reusable UI components)
- [x] Build multi-stage Dockerfiles and Nginx reverse proxy routing
- [x] Create cross-platform management scripts (`init`, `backup`, `restore`, `healthcheck`)
- [x] Setup GitHub Actions workflow for linting, build checks, and testing
- [x] Initialize Git repository with `main` and `develop` branches and Conventional Commits

---

## 🛑 Known Issues & Technical Debt

*No active issues. Foundation initialized cleanly.*

---

## ⏭ Next Milestone: Phase 1 — Authentication & User Management
- Implement user registration with Argon2id password hashing
- Implement login with JWT access token + refresh token rotation
- Implement user session revocation & audit log tracking
- Connect frontend auth state to TanStack Query and React Hook Form
