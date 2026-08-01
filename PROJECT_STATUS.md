# Moneto — Project Status & Sprint Tracker

**Current Phase**: Phase 0 — Foundation & Infrastructure Hardening Sprint (Complete)  
**Version**: `v0.2.0-alpha`  
**Last Updated**: 2026-08-02  

---

## 🟢 Status Summary

| Area | Status | Target Completion |
| :--- | :---: | :---: |
| **Monorepo Architecture** | 🟢 Complete | Phase 0 |
| **Documentation Suite (01-09)** | 🟢 Complete | Phase 0 |
| **PostgreSQL Multi-DB Isolation** | 🟢 Complete | Phase 0 |
| **Prisma ORM & Migrate Integration** | 🟢 Complete | Phase 0+ |
| **Backend Express API Skeleton** | 🟢 Complete | Phase 0 |
| **Frontend React SPA Shell & UI System** | 🟢 Complete | Phase 0 |
| **Docker & Nginx Reverse Proxy** | 🟢 Complete | Phase 0 |
| **Cross-Platform Administrative Scripts** | 🟢 Complete | Phase 0 |
| **CI/CD GitHub Actions Pipeline** | 🟢 Complete | Phase 0 |
| **Auth & Security Module** | ⏳ Pending Phase 1 | Phase 1 |
| **Transactions & Payables Module** | ⏳ Pending Phase 2 | Phase 2 |

---

## 📋 Milestone Tracker

### Milestone 0: Foundation Initialization (Complete)
- [x] Create monorepo directory layout (`backend`, `frontend`, `database`, `docker`, `nginx`, `scripts`, `docs`, `.github`)
- [x] Write technical documentation suite (`01-project-vision.md` through `09-changelog.md`)
- [x] Define multi-environment PostgreSQL DDL (`moneto_dev`, `moneto_test`, `moneto_prod`) with 12 core tables
- [x] Configure backend architecture (Express, TypeScript strict, Argon2id, JWT rotation, Helmet, Winston logger, audit middleware)
- [x] Configure frontend application shell (React, Vite, TypeScript, Tailwind CSS, Light/Dark/System theme provider, reusable UI components)
- [x] Build multi-stage Dockerfiles and Nginx reverse proxy routing
- [x] Create cross-platform management scripts (`init`, `backup`, `restore`, `healthcheck`)
- [x] Setup GitHub Actions workflow for linting, build checks, and testing
- [x] Initialize Git repository with `main` and `develop` branches and Conventional Commits

### Milestone 0+: Prisma ORM Integration (Complete)
- [x] Install `@prisma/client` v5.22.0 and `prisma` CLI into `backend/`
- [x] Create `backend/prisma/schema.prisma` with 12 enterprise models using `@map` column bindings and UUID PKs
- [x] Generate baseline migration `20260802000000_init_prisma_schema` representing all 12 enterprise tables
- [x] Create idempotent `backend/prisma/seed.ts` for default system transaction categories
- [x] Export `PrismaClient` singleton from `backend/src/config/database.config.ts`
- [x] Update `backend.Dockerfile` with `npx prisma generate` build step
- [x] Update `docker-compose.yml` with `DATABASE_URL` and `prisma migrate deploy` on container startup
- [x] Add `prisma:*` npm scripts to `backend/package.json`
- [x] Update `.env.example` with `DATABASE_URL` and `DIRECT_URL`
- [x] Update `docs/04-database.md` and `docs/07-deployment.md` with migration workflow
- [x] Validate schema: `prisma validate` ✅
- [x] Validate client generation: `prisma generate` ✅
- [x] Create 3 structured Git commits (`chore`, `feat`, `docs`)

---

## 🗄 Prisma CLI Reference

All commands run inside `backend/`:

| Command | Action |
| :--- | :--- |
| `npm run prisma:generate` | Regenerate TypeScript Prisma Client |
| `npm run prisma:migrate` | Create new migration during development |
| `npm run prisma:deploy` | Apply pending migrations (CI/Prod) |
| `npm run prisma:reset` | Reset DB and re-apply all migrations (dev only) |
| `npm run prisma:seed` | Run idempotent category seed script |
| `npm run prisma:studio` | Open visual database GUI at `http://localhost:5555` |

---

## 🛑 Known Issues & Technical Debt
- `DIRECT_URL` env variable removed from schema `datasource` block (not needed for direct PostgreSQL connections — only required for Prisma Accelerate/connection pooling proxy setups).
- `node_modules/` is excluded from Git via `.gitignore`. Run `npm install` after cloning.

---

## ⏭ Next Milestone: Phase 1 — Authentication & User Management
- Implement user registration with Argon2id password hashing
- Implement login with JWT access token + refresh token rotation
- Implement user session revocation & audit log tracking via Prisma ORM
- Connect frontend auth state to TanStack Query and React Hook Form
