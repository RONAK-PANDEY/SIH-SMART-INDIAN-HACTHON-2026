@echo off
echo ===================================================================
echo Starting SmartCare SIH 2026 Unified Health Platform Local Services
echo ===================================================================

echo [1/4] Launching FastAPI Backend (Port 8000)...
start "SmartCare Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 >nul

echo [2/4] Launching Patient Portal (Port 5173)...
start "SmartCare Patient Portal (5173)" cmd /k "cd patient-portal && npm run dev -- --port 5173 --host"
timeout /t 1 >nul

echo [3/4] Launching Hospital Admin & Doctor Portal (Port 5174)...
start "SmartCare Admin Portal (5174)" cmd /k "cd admin-portal && npm run dev -- --port 5174 --host"
timeout /t 1 >nul

echo [4/4] Launching Govt Observer & Vigilance Portal (Port 5175)...
start "SmartCare Govt Observer Portal (5175)" cmd /k "cd govt-portal && npm run dev -- --port 5175 --host"

echo.
echo ===================================================================
echo All 4 SmartCare Platform Services Launched Successfully!
echo - FastAPI Backend:          http://localhost:8000 (Swagger: http://localhost:8000/docs)
echo - Citizen / Patient Portal: http://localhost:5173
echo - Hospital Admin & Doctor:  http://localhost:5174
echo - Govt Observer & Bonus:    http://localhost:5175
echo ===================================================================
echo.
pause
