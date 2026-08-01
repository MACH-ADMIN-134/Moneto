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
Update all passwords, JWT secrets, and domain names in `.env`.

### 3. Stack Initialization
Run production containers via Docker Compose:
```bash
docker compose up --build -d
```

### 4. Health & Status Verification
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

Backups are saved to `database/backups/moneto_backup_YYYYMMDD_HHMMSS.sql.gz`.

### Restoring from Backup
To restore a specific dump:
- Linux/macOS: `./scripts/restore.sh database/backups/moneto_backup_YYYYMMDD_HHMMSS.sql.gz`
- Windows: `.\scripts\restore.ps1 -BackupFile database\backups\moneto_backup_YYYYMMDD_HHMMSS.sql.gz`
