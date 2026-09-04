@echo off
echo ===================================================
echo Starting SmartCare SIH 2026 Local Services...
echo ===================================================

start "SmartCare Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 >nul

start "SmartCare Patient Portal (5173)" cmd /k "cd patient-portal && npm run dev -- --port 5173 --host"
timeout /t 1 >nul

start "SmartCare Admin Portal (5174)" cmd /k "cd admin-portal && npm run dev -- --port 5174 --host"

echo.
echo All services launched!
echo - FastAPI Backend:       http://localhost:8000 (Swagger: http://localhost:8000/docs)
echo - Patient Portal:        http://localhost:5173
echo - Admin & Doctor Panel:  http://localhost:5174
echo.
pause
