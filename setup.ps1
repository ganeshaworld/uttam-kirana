# Uttam Kirana - PowerShell Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uttam Kirana - Windows Setup"          -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
    Write-Host "        Download from: https://nodejs.org (LTS version)" -ForegroundColor Yellow
    exit 1
}

# Check / install pnpm
try {
    $pnpmVersion = pnpm --version 2>&1
    Write-Host "[OK] pnpm $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] pnpm install failed." -ForegroundColor Red; exit 1 }
}

# Create .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "====================================================="-ForegroundColor Yellow
    Write-Host "  ACTION REQUIRED: Edit .env before continuing!"     -ForegroundColor Yellow
    Write-Host "=====================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Open .env and fill in:" -ForegroundColor White
    Write-Host "    DATABASE_URL   = postgresql://user:pass@localhost:5432/uttam_kirana"
    Write-Host "    SESSION_SECRET = any_long_random_string"
    Write-Host ""
    Write-Host "  Press Enter after editing .env ..."
    Read-Host
} else {
    Write-Host "[OK] .env file found" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] pnpm install failed." -ForegroundColor Red; exit 1 }
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# Push DB schema
Write-Host ""
Write-Host "[INFO] Pushing database schema..." -ForegroundColor Yellow
pnpm --filter "@workspace/db" run push
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] DB schema push failed. Check DATABASE_URL in .env" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Database schema ready" -ForegroundColor Green

# Seed
Write-Host ""
Write-Host "[INFO] Seeding demo data..." -ForegroundColor Yellow
pnpm --filter "@workspace/scripts" run seed
Write-Host "[OK] Done" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Run: .\start.ps1"       -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
