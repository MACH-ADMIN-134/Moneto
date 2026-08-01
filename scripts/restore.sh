#!/usr/bin/env bash
# Moneto Database Restore Script (Bash)

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Backup file path required. Usage: ./restore.sh <path_to_sql>"
    exit 1
fi

BACKUP_FILE=$1

echo "⏳ Restoring database from ${BACKUP_FILE}..."
cat ${BACKUP_FILE} | docker exec -i moneto-postgres psql -U moneto_admin -d moneto_prod

echo "✅ Restoration completed!"
