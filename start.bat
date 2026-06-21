@echo off
echo.
echo  ========================================
echo   Uttam Kirana - Starting Dev Servers
echo  ========================================
echo.
echo  Starting API server in a new window...
start "Uttam Kirana - API Server" cmd /k "pnpm --filter @workspace/api-server run dev"

echo  Waiting 3 seconds for API to start...
timeout /t 3 /nobreak >nul

echo  Starting frontend in a new window...
start "Uttam Kirana - Frontend" cmd /k "pnpm --filter @workspace/uttam-kirana run dev"

echo.
echo  =========================================
echo   Both servers are starting!
echo  =========================================
echo.
echo   Frontend:  http://localhost:5173
echo   API:       http://localhost:8080
echo.
echo   Demo login:
echo     Admin:    9999999999
echo     Delivery: 8888888888
echo     Customer: any 10-digit number
echo   (OTP is shown in the API server window)
echo.
echo  This window can be closed.
pause
