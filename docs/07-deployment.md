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

Required environment variables:
```env
DATABASE_URL="postgresql://moneto_admin:<password>@postgres:5432/moneto_prod?schema=public"
DIRECT_URL="postgresql://moneto_admin:<password>@postgres:5432/moneto_prod?schema=public"
```

### 3. Stack Initialization
Run production containers via Docker Compose:
```bash
docker compose up --build -d
```

The backend container automatically runs **`npx prisma migrate deploy`** on startup before the Express server starts, ensuring all pending database migrations are applied safely.

### 4. Prisma Migration Workflow

> [!IMPORTANT]
> **Development**: Use `npm run prisma:migrate` (creates and applies migration).
> **Staging/Production**: Use `npm run prisma:deploy` (applies pending migrations only — never creates new ones).

#### Creating a New Schema Change
```bash
# Inside backend/
npx prisma migrate dev --name describe_your_change
```

This generates a new migration file in `backend/prisma/migrations/` with a timestamped directory name. Commit migration files alongside schema changes.

#### Applying Migrations in CI/CD
```bash
cd backend && npx prisma migrate deploy
```

#### Opening Prisma Studio (Database GUI)
```bash
cd backend && npx prisma studio
# Opens at http://localhost:5555
```

### 5. Health & Status Verification
Verify container status:
```bash
docker compose ps
```
Run cross-platform healthcheck script:
- Linux/macOS: `./scripts/healthcheck.sh`
- Windows: `.\scripts\healthcheck.ps1`

---

## 💾 Database Backup & Disaster Recovery

### Creating Automated Database Dump
To create a timestamped compressed backup of `moneto_prod`:
- Linux/macOS: `./scripts/backup.sh`
- Windows: `.\scripts\backup.ps1`

Backups are saved to `database/backups/moneto_backup_YYYYMMDD_HHMMSS.sql`.

### Restoring from Backup
To restore a specific dump:
- Linux/macOS: `./scripts/restore.sh database/backups/moneto_backup_YYYYMMDD_HHMMSS.sql`
- Windows: `.\scripts\restore.ps1 -BackupFile database\backups\moneto_backup_YYYYMMDD_HHMMSS.sql`

> [!WARNING]
> After restoring from a backup, run `npx prisma migrate deploy` inside `backend/` to verify migration state is synchronized.
