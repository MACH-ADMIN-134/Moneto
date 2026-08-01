# Moneto — Security-First Personal Finance Platform

![Moneto Banner](https://img.shields.io/badge/Moneto-v0.1.0--alpha-10b981?style=for-the-badge&logo=shield)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Argon2id%20%7C%20JWT-purple?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-darkgreen?style=for-the-badge)
![ORM](https://img.shields.io/badge/ORM-Prisma%20v5-2D3748?style=for-the-badge&logo=prisma)

Moneto is an enterprise-grade, security-first personal finance platform built for seamless cross-platform financial tracking, budgeting, payable management, and lending analytics. 

---

## 🏛 Platform Philosophy

- 📱 **Mobile-First**: Designed natively for responsive touch devices first, adapting effortlessly to desktop screens.
- 🔌 **API-First**: Standardized RESTful `/api/v1` architecture decoupled for Web, Android (Capacitor), and iOS apps.
- 🛡 **Security-First**: Enterprise cryptography (Argon2id password hashing, JWT refresh token rotation, strict rate limiting, security headers, and full database audit logging).
- 📚 **Documentation-First**: Exhaustive technical documentation covering vision, database design, security policies, API specs, and deployment guide.
- 🐳 **Docker-First**: Fully containerized environment with multi-stage production Dockerfiles and Nginx reverse proxy routing.
- 🌿 **Git-First**: Strict branch strategy (`main`, `develop`, `feature/*`) and Conventional Commits workflow.

---

## 📁 Repository Structure

```text
moneto/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma ORM schema (12 models)
│   │   ├── seed.ts                # Idempotent seed script
│   │   └── migrations/            # Prisma migration history
│   └── src/                       # Express + TypeScript Security-First API
├── frontend/           # React + TypeScript + Vite + Tailwind CSS SPA
├── database/           # PostgreSQL DDL Schemas & Seeds (Dev, Test, Prod)
├── docker/             # Production & Multi-stage Dockerfiles
├── nginx/              # Reverse Proxy Nginx Configuration & Security Headers
├── scripts/            # Cross-platform administration scripts (.sh & .ps1)
├── docs/               # Technical Documentation Suite (01-09)
├── .github/            # GitHub Actions CI/CD workflows
├── docker-compose.yml  # Production Docker Compose stack
├── docker-compose.dev.yml # Local Development hot-reload stack
├── .env.example        # Environment configuration template
├── PROJECT_STATUS.md   # Sprint, Roadmap, and System Health tracking
└── README.md
```

---

## 🚀 Quick Start (Docker Compose)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- Node.js (v20+) & npm (v10+) *[Optional for local dev without Docker]*

### 2. Environment Setup
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```

### 3. Launch Development Environment
Run the cross-platform initialization script or launch via Docker Compose:

**Linux / macOS:**
```bash
chmod +x scripts/init.sh
./scripts/init.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\init.ps1
```

Or manually with Docker:
```bash
docker compose -f docker-compose.dev.yml up --build -d
```

### 4. Initialize Prisma (after dev DB is running)
```bash
cd backend
npm run prisma:generate    # Generate Prisma Client types
npm run prisma:deploy      # Apply migrations to database
npm run prisma:seed        # Seed default categories
npm run prisma:studio      # Open DB GUI at http://localhost:5555
```

---

## 🌐 Default Ports & Access Points

| Service | Container | URL |
| :--- | :--- | :--- |
| **Nginx Reverse Proxy** | `moneto-nginx` | `http://localhost:80` |
| **Frontend Web App** | `moneto-frontend` | `http://localhost:3000` |
| **Backend REST API** | `moneto-backend` | `http://localhost:5000/api/v1` |
| **PostgreSQL Database** | `moneto-postgres` | `localhost:5432` (`moneto_dev`, `moneto_test`, `moneto_prod`) |
| **Prisma Studio** | Local tool | `http://localhost:5555` |

---

## 🔒 Security Baseline

- **Password Storage**: Argon2id (`t=3, m=65536, p=4`)
- **Authentication**: Dual-token strategy (Short-lived Access Token + HTTP-Only Refresh Token with Rotation)
- **Data Protection**: Prepared statements, strict CORS, rate-limiting on sensitive endpoints (`/auth/login`), Helmet security headers, full HTTP audit logging to `audit_logs`.
- **Soft Deletions**: Financial records use `deleted_at` timestamps for immutable historical integrity.

---

## 📜 Documentation Index

See [/docs](docs/) for complete system documentation:
- [01-project-vision.md](docs/01-project-vision.md)
- [02-roadmap.md](docs/02-roadmap.md)
- [03-architecture.md](docs/03-architecture.md)
- [04-database.md](docs/04-database.md)
- [05-api-spec.md](docs/05-api-spec.md)
- [06-security.md](docs/06-security.md)
- [07-deployment.md](docs/07-deployment.md)
- [08-testing.md](docs/08-testing.md)
- [09-changelog.md](docs/09-changelog.md)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
