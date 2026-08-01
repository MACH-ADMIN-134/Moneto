# Moneto Environment Initialization Script (Windows PowerShell)

Write-Host "🛡 Initializing Moneto Project Stack..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "📄 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "🐳 Launching Docker Compose Infrastructure..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml up -d

Write-Host "✅ Environment initialized successfully!" -ForegroundColor Green
