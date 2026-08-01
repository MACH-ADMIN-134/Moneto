# Moneto Health Check Script (PowerShell)

Write-Host "🔍 Running Moneto Platform Health Audit..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Method Get -ErrorAction Stop
    if ($response.success -eq $true) {
        Write-Host "🟢 Backend API Health: OK (Status: $($response.data.status))" -ForegroundColor Green
    } else {
        Write-Host "🔴 Backend API Returned Warning" -ForegroundColor Yellow
    }
} catch {
    Write-Host "🔴 Backend API Unavailable (Ensure container is running)" -ForegroundColor Red
}
