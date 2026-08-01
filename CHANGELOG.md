# Changelog

All notable changes to the Moneto platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
