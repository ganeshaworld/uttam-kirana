@echo off
setlocal enabledelayedexpansion

echo.
echo  ========================================
echo   Uttam Kirana - Windows Setup
echo  ========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed.
    echo  Download from: https://nodejs.org  (LTS version)
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER%

:: Check pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo  [INFO] Installing pnpm...
    npm install -g pnpm
    if errorlevel 1 (
        echo  [ERROR] Failed to install pnpm.
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VER=%%i
echo  [OK] pnpm %PNPM_VER%

:: Create .env if it doesn't exist
if not exist .env (
    echo.
    echo  [SETUP] Creating .env file...
    copy .env.example .env >nul
    echo.
    echo  =====================================================
    echo   ACTION REQUIRED: Edit the .env file now!
    echo  =====================================================
    echo.
    echo   Open .env and set:
    echo     DATABASE_URL  = your PostgreSQL connection string
    echo     SESSION_SECRET = any long random string
    echo.
    echo   Example DATABASE_URL:
    echo     postgresql://postgres:password@localhost:5432/uttam_kirana
    echo.
    echo   Press any key after you have edited .env ...
    pause >nul
) else (
    echo  [OK] .env file found
)

:: Install dependencies
echo.
echo  [INFO] Installing dependencies (this may take 2-3 minutes)...
pnpm install
if errorlevel 1 (
    echo  [ERROR] pnpm install failed.
    pause
    exit /b 1
)
echo  [OK] Dependencies installed

:: Push database schema
echo.
echo  [INFO] Pushing database schema...
pnpm --filter @workspace/db run push
if errorlevel 1 (
    echo  [ERROR] Database setup failed. Check your DATABASE_URL in .env
    pause
    exit /b 1
)
echo  [OK] Database schema ready

:: Seed demo data
echo.
echo  [INFO] Seeding demo data...
pnpm --filter @workspace/scripts run seed
if errorlevel 1 (
    echo  [WARN] Seed had errors - database may already have data (this is OK)
)

echo.
echo  ========================================
echo   Setup Complete!
echo  ========================================
echo.
echo   Run  start.bat  to launch the app.
echo.
pause
