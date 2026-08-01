# Changelog

All notable changes to the Moneto platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha] - 2026-08-02 — Sprint 1: Identity & Access Layer

### Added
- **Authentication Engine**: Fully integrated Argon2id password hashing and dual-JWT token rotation (`user_sessions` tracking with SHA-256 token hash validation, IP/user-agent tracking, session revocation).
- **User Governance & Profile**:
  - Get and update user profile details (`GET /users/me`, `PUT /users/me`).
  - Argon2id password change workflow (`POST /users/me/change-password`) with automatic session revocation.
  - User preference and theme settings management (`PUT /users/me/preferences`).
  - Local avatar file storage abstraction (`StorageService` uploading to `/uploads/avatars/`).
  - Active session management (`GET /users/me/sessions`, `POST /users/me/sessions/revoke-all`).
- **RBAC Authorization**: Implemented Role-Based Access Control middleware (`requireRole('USER' | 'ADMIN' | 'SUPER_ADMIN')`).
- **Category Engine**: Category CRUD supporting custom user categories, system categories protection (`isSystem: true`), soft deletion (`deleted_at`), pagination, and type filtering (`income`, `expense`, `transfer`).
- **Centralized Feature Flags**: `featureFlags.service.ts` exposing environment flags (`ENABLE_AI`, `ENABLE_UPI`, `ENABLE_INVESTMENTS`, `ENABLE_NOTIFICATIONS`) and endpoint `GET /api/v1/feature-flags`.
- **Vitest Testing Suite**: Added integration test suites for Authentication (`auth.test.ts`) and Categories (`categories.test.ts`).

---

## [0.2.0-alpha] - 2026-08-02

### Added
- **Security Hardening**: Applied Helmet security headers (CSP, HSTS 1-year max-age, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), strict CORS white-listing, rate limiting, and created [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md).
- **Request Correlation**: Created `requestId` middleware injecting unique UUID v4 tracking headers (`X-Request-ID` and `X-Correlation-ID`) across every HTTP lifecycle.
- **Structured Winston Logging**: Updated `logger.ts` to output structured JSON logs with ISO timestamps, correlation ID context, and log level formatting.
- **Observability Probes**: Added `/api/v1/health` (uptime & system info), `/api/v1/ready` (Prisma database probe), and `/api/v1/live` (process liveness probe).
- **OpenAPI & Swagger UI**: Mounted interactive OpenAPI documentation at `/api/v1/docs` using `swagger-ui-express`.
- **Vitest & Supertest Testing Framework**: Configured Vitest in `backend/` with automated integration tests for health probes (`health.test.ts`) and security headers (`security.test.ts`).
- **Developer Tooling**: Created root `Makefile` (`make dev`, `make build`, `make test`), Windows PowerShell helper CLI (`scripts/moneto-helper.ps1`), `.commitlintrc.json`, and `.lintstagedrc.json`.
- **CI Pipeline Enhancement**: Updated `.github/workflows/ci.yml` to automatically execute Vitest unit/integration tests during build verification.

---

## [0.1.1-alpha] - 2026-08-02

### Added
- **Prisma ORM Integration**: Installed `@prisma/client` v5 and `prisma` CLI alongside existing PostgreSQL `pg` pool. Both clients exported from `backend/src/config/database.config.ts` for backward compatibility.
- **Prisma Schema**: Created `backend/prisma/schema.prisma` with 12 strongly-typed models mapped 1:1 to existing PostgreSQL tables using `@map` annotations — preserving exact column names, UUID PKs (`@db.Uuid`), foreign key constraints, `deletedAt` soft-delete fields, and `@@index` definitions.
- **Baseline Migration**: Generated `backend/prisma/migrations/20260802000000_init_prisma_schema/migration.sql` representing the full enterprise DDL as the Prisma migration baseline.
- **Idempotent Seed Script**: Created `backend/prisma/seed.ts` that uses `findFirst` + `create` pattern to idempotently populate default system transaction categories on every run.
- **Package Scripts**: Added `prisma:generate`, `prisma:migrate`, `prisma:deploy`, `prisma:reset`, `prisma:seed`, and `prisma:studio` to `backend/package.json`.
- **Docker Integration**: Updated `docker/backend.Dockerfile` with `npx prisma generate` in the build stage and `prisma migrate deploy` in the Docker Compose production container startup command.
- **Environment Variables**: Added `DATABASE_URL` and `DIRECT_URL` to `.env.example`.

---

## [0.1.0-alpha] - 2026-08-02

### Added
- **Monorepo Foundation**: Standard monorepo layout separating `backend`, `frontend`, `database`, `docker`, `nginx`, `scripts`, `docs`, and `.github`.
- **Documentation Suite**: 9 enterprise documentation files detailing Vision, Roadmap, Architecture, Database Schemas, API Specifications, Security Controls, Deployment, Testing, and Changelog protocol.
- **Database Infrastructure**: PostgreSQL init scripts for environment isolation (`moneto_dev`, `moneto_test`, `moneto_prod`) and 12-table enterprise DDL schema with UUID primary keys, foreign keys, soft deletes (`deleted_at`), UTC timestamps, and composite indexing.
- **Backend Architecture**: Express + TypeScript modular architecture foundation with Argon2id password hashing, dual JWT token rotation, Helmet security headers, Winston logger, and Zod request validation.
- **Frontend Architecture**: Mobile-first React 18 + Vite + Tailwind CSS web application with a glassmorphism design system, dark/light theme context, and reusable atomic components.
- **Docker & Infrastructure**: Multi-stage production `backend.Dockerfile`, `frontend.Dockerfile`, and Nginx reverse proxy configuration supporting SSL, HSTS, CSP, and SPA fallback routing.
- **Operational Scripts**: Cross-platform `.sh` and `.ps1` administrative scripts for database initialization, backup creation, data restoration, and environment health checks.
- **CI/CD Pipeline**: GitHub Actions CI workflow checking code quality, compilation, docker build capability, and testing.
