#!/usr/bin/env bash
# Moneto Automated PostgreSQL Backup Script (Bash)

set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="database/backups"
BACKUP_FILE="${BACKUP_DIR}/moneto_backup_${TIMESTAMP}.sql"

mkdir -p ${BACKUP_DIR}

echo "💾 Creating PostgreSQL Database Backup for moneto_prod..."
docker exec -t moneto-postgres pg_dump -U moneto_admin moneto_prod > ${BACKUP_FILE}

echo "✅ Backup created at ${BACKUP_FILE}"
