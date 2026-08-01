# Moneto Automated PostgreSQL Backup Script (PowerShell)

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "database\backups"
$BackupFile = "$BackupDir\moneto_backup_$Timestamp.sql"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

Write-Host "💾 Creating PostgreSQL Database Backup for moneto_prod..." -ForegroundColor Cyan
docker exec -t moneto-postgres pg_dump -U moneto_admin moneto_prod > $BackupFile

Write-Host "✅ Backup created at $BackupFile" -ForegroundColor Green
