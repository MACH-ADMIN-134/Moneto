# Moneto Database Restore Script (PowerShell)

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Error: Backup file not found at $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Restoring database from $BackupFile..." -ForegroundColor Cyan
Get-Content $BackupFile | docker exec -i moneto-postgres psql -U moneto_admin -d moneto_prod

Write-Host "✅ Restoration completed!" -ForegroundColor Green
