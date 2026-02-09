@echo off
REM Start FastAPI Backend for Restaurant Management System (Windows)
pushd "%~dp0"
cd backend

echo.
echo ========================================
echo Starting FastAPI Backend...
echo ========================================
echo.

REM Check if venv exists, if not create it
if not exist venv (
  echo Creating virtual environment...
  python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements if needed
if not exist venv\Scripts\pip.exe (
  echo Installing dependencies...
  pip install -r requirements.txt
) else (
  REM Check and update requirements quietly
  pip install -q -r requirements.txt 2>nul
)

REM Create .env file if it doesn't exist
if not exist .env (
  echo Creating .env file from .env.example...
  copy .env.example .env
)

REM Start the FastAPI server
echo.
echo Starting Uvicorn server on http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

popd
