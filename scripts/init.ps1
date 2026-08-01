# Moneto Environment Initialization Script (Windows PowerShell)

Write-Host "🛡 Initializing Moneto Project Stack..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "📄 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "🐳 Launching Docker Compose Infrastructure..." -ForegroundColor Cyan
docker compose -f docker-compose.dev.yml up -d

Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Push-Location backend
npm install
Pop-Location

Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
Push-Location backend
npx prisma generate
Pop-Location

Write-Host "🗄 Running Prisma Migrations..." -ForegroundColor Cyan
Push-Location backend
npx prisma migrate deploy
Pop-Location

Write-Host "🌱 Seeding Default Categories..." -ForegroundColor Cyan
Push-Location backend
npx prisma db seed
Pop-Location

Write-Host "✅ Environment initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Available Endpoints:" -ForegroundColor Yellow
Write-Host "   API:      http://localhost:5000/api/v1/health"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Studio:   Run 'npx prisma studio' inside ./backend"
