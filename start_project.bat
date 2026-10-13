@echo off
cd /d "%~dp0"
echo ========================================================
echo       Starting VoiceBridge Mini Project
echo ========================================================
echo.

if not exist "%~dp0backend\.venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found at backend\.venv!
    echo Please make sure backend\.venv is configured.
    pause
    exit /b 1
)

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "VoiceBridge Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "VoiceBridge Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo VoiceBridge is now running!
echo - Frontend Web Application: http://localhost:5173
echo - Backend API Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo Keep the backend and frontend terminal windows open.
echo.
pause
