# VoiceBridge Backend Launcher
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $BackendDir

$VenvPython = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[ERROR] Virtual environment python not found at $VenvPython" -ForegroundColor Red
    Write-Host "Please create it using: python -m venv .venv; .\.venv\Scripts\pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting VoiceBridge FastAPI Backend via .venv..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

& $VenvPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
