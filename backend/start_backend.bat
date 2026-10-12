@echo off
cd /d "%~dp0"
echo ========================================================
echo Starting VoiceBridge FastAPI Backend (.venv)
echo ========================================================
if not exist ".\.venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .venv!
    echo Please run: python -m venv .venv ^&^& .\.venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
