@echo off
REM Start Restaurant Management System - Frontend & Backend

echo ========================================
echo Restaurant Management System
echo ========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Install Backend Dependencies
echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..
echo Backend dependencies installed.
echo.

REM Install Frontend Dependencies
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..
echo Frontend dependencies installed.
echo.

REM Start Backend in a new window
echo Starting Backend (FastAPI) on http://localhost:8000
start "RMS Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend in a new window
echo Starting Frontend (React) on http://localhost:5173
start "RMS Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for servers to fully start before opening Chrome
echo Waiting for servers to start...
timeout /t 5 /nobreak

REM Open Chrome
echo Opening Chrome...
start chrome http://localhost:5173

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo.
echo Close the terminal windows to stop the servers.
echo ========================================
echo.

pause
