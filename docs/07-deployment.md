# 07 — Deployment & Infrastructure Guide

## Docker Compose Production Deployment

### 1. Host Requirements
- **OS**: Linux (Ubuntu 22.04 LTS recommended) / Windows Server / macOS
- **CPU**: 2 Cores minimum
- **RAM**: 4 GB RAM minimum
- **Storage**: 20 GB SSD

### 2. Environment Configuration
Ensure `.env` file exists with production-grade secrets:
```bash
cp .env.example .env
```
Update all passwords, JWT secrets, `DATABASE_URL`, and domain names in `.env`.

### 3. Developer Makefile Shortcuts
```bash
make help          # View all available shortcuts
make dev           # Start development mode
make build         # Compile TypeScript projects
make test          # Run Vitest test suite
make docker-up     # Launch production Docker containers
make docker-down   # Stop Docker containers
make prisma-studio # Open Prisma Studio GUI
```

### 4. Observability & Health Probes

| Probe Endpoint | Purpose | Target / Behavior |
| :--- | :--- | :--- |
| `GET /api/v1/health` | System Status | Returns uptime, version (`v0.2.0-alpha`), and status |
| `GET /api/v1/ready` | Readiness Probe | Verifies PostgreSQL connectivity via Prisma |
| `GET /api/v1/live` | Liveness Probe | Verifies HTTP process event loop responsiveness |
| `GET /api/v1/docs` | Swagger UI | Interactive OpenAPI documentation |

### 5. Health & Status Verification
Verify container status:
```bash
docker compose ps
```
Run cross-platform healthcheck script:
- Linux/macOS: `./scripts/healthcheck.sh`
- Windows: `.\scripts\moneto-helper.ps1 -Command health`
