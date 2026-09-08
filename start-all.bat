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

:: STEP 2: Open Windows Firewall for port 8000 (Android scanner needs this)
echo [FIREWALL] Opening port 8000 for Android scanner app...
netsh advfirewall firewall delete rule name="SmartCare Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="SmartCare Port 8000" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
echo   Done.

:: STEP 3: Show current Wi-Fi IP (needed for Android app Settings)
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
echo   ^^^ Use your Wi-Fi address above in your Android scanner app Settings
echo       Backend URL should be:  http://^<Wi-Fi IP^>:8000
echo.

:: STEP 4: Launch all 4 services
echo [1/4] Starting FastAPI Backend on port 8000...
start "SmartCare - Backend :8000" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 && pause"
timeout /t 3 >nul

echo [2/4] Starting Patient Portal on port 5173...
start "SmartCare - Patient Portal :5173" cmd /k "cd /d "%~dp0patient-portal" && npm run dev -- --port 5173 --host && pause"
timeout /t 1 >nul

echo [3/4] Starting Admin / Doctor Portal on port 5174...
start "SmartCare - Admin Portal :5174" cmd /k "cd /d "%~dp0admin-portal" && npm run dev -- --port 5174 --host && pause"
timeout /t 1 >nul

echo [4/4] Starting Govt Observer Portal on port 5175...
start "SmartCare - Govt Portal :5175" cmd /k "cd /d "%~dp0govt-portal" && npm run dev -- --port 5175 --host && pause"

:: STEP 5: Final summary
echo.
echo  =====================================================================
echo   All 4 services launched! Open these in your browser:
echo.
echo   Backend API + Swagger : http://localhost:8000/docs
echo   Patient Portal        : http://localhost:5173
echo   Admin / Doctor Panel  : http://localhost:5174
echo   Govt Observer Portal  : http://localhost:5175
echo.
echo   Android Scanner App   : Set Backend URL = http://^<Wi-Fi IP^>:8000
echo                           (Wi-Fi IPs shown above)
echo  =====================================================================
echo.
pause