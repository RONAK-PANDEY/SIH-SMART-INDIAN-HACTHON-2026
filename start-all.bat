@echo off
title SmartCare SIH26133 - Launcher
color 0A

echo.
echo  =====================================================================
echo   SmartCare (SIH26133) - Smart Hospital Queue Management System
echo   SIH 2026  ^|  Full-Stack Local Dev Launcher
echo  =====================================================================
echo.

:: STEP 1: Kill any process already using our ports
echo [PRE-CHECK] Freeing ports 8000, 5173, 5174, 5175 if already in use...

for %%P in (8000 5173 5174 5175) do (
    for /f "tokens=5" %%i in ('netstat -aon ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo   Killing PID %%i on port %%P
        taskkill /PID %%i /F >nul 2>&1
    )
)
timeout /t 1 >nul

:: STEP 2: Show current Wi-Fi IP (needed for Android app Settings)
echo.
echo [NETWORK] Your current Wi-Fi IP addresses:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    setlocal enabledelayedexpansion
    set ip=!ip: =!
    echo   !ip!
    endlocal
)
echo.

:: STEP 3: Launch all 4 services
echo [1/4] Starting FastAPI Backend on port 8000...
start "SmartCare - Backend :8000" cmd /k "cd /d ""%~dp0backend"" && echo Starting backend... && (py -3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 || python -m uvicorn main:app --host 0.0.0.0 --port 8000 || py -m uvicorn main:app --host 0.0.0.0 --port 8000) && pause"
timeout /t 2 >nul

echo [2/4] Starting Patient Portal on port 5173...
start "SmartCare - Patient Portal :5173" cmd /k "cd /d ""%~dp0patient-portal"" && npm run dev -- --port 5173 --strictPort --host && pause"
timeout /t 1 >nul

echo [3/4] Starting Admin / Doctor Portal on port 5174...
start "SmartCare - Admin Portal :5174" cmd /k "cd /d ""%~dp0admin-portal"" && npm run dev -- --port 5174 --strictPort --host && pause"
timeout /t 1 >nul

echo [4/4] Starting Govt Observer Portal on port 5175...
start "SmartCare - Govt Portal :5175" cmd /k "cd /d ""%~dp0govt-portal"" && npm run dev -- --port 5175 --strictPort --host && pause"

:: STEP 4: Final summary & Launch Browsers
echo.
echo  =====================================================================
echo   All 4 services launched!
echo.
echo   Patient Portal        : http://localhost:5173
echo   Admin / Doctor Panel  : http://localhost:5174
echo   Govt Observer Portal  : http://localhost:5175
echo   Backend API + Swagger : http://localhost:8000/docs
echo.
echo  =====================================================================
echo.

echo [BROWSER] Waiting 3 seconds for servers to initialize, then opening portals...
timeout /t 3 >nul

start http://localhost:5173
start http://localhost:5174
start http://localhost:5175
start http://localhost:8000/docs

echo All tabs opened successfully! Keep these terminal windows open to keep the servers running.
pause
