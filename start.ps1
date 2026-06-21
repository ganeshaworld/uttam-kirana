# Uttam Kirana - PowerShell Start Script
# Run with: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uttam Kirana - Starting Dev Servers"   -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start API server
Write-Host "[INFO] Starting API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --filter '@workspace/api-server' run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Write-Host "[INFO] Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm --filter '@workspace/uttam-kirana' run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Both servers are starting!"             -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend :  http://localhost:5173"
Write-Host "  API      :  http://localhost:8080"
Write-Host ""
Write-Host "  Demo login:"
Write-Host "    Admin    : 9999999999"
Write-Host "    Delivery : 8888888888"
Write-Host "    Customer : any 10-digit number"
Write-Host "  (OTP appears in the API server window)"
Write-Host ""
