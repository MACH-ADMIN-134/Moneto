# Moneto PowerShell Administration Helper CLI (Windows)

param (
    [string]$Command = "help"
)

Write-Host "🛡 Moneto DevSecOps Helper CLI" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray

switch ($Command.ToLower()) {
    "init" {
        & ".\scripts\init.ps1"
    }
    "health" {
        & ".\scripts\healthcheck.ps1"
    }
    "backup" {
        & ".\scripts\backup.ps1"
    }
    "studio" {
        Push-Location backend
        npx prisma studio
        Pop-Location
    }
    default {
        Write-Host "Available Commands:" -ForegroundColor Yellow
        Write-Host "  .\scripts\moneto-helper.ps1 -Command init     (Initialize Docker & Stack)"
        Write-Host "  .\scripts\moneto-helper.ps1 -Command health   (Run Health Audit)"
        Write-Host "  .\scripts\moneto-helper.ps1 -Command backup   (Create Database Dump)"
        Write-Host "  .\scripts\moneto-helper.ps1 -Command studio   (Open Prisma Studio GUI)"
    }
}
