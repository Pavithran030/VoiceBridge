Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Starting VoiceBridge Mini Project (PowerShell)    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$backendPy = Join-Path $root "backend\.venv\Scripts\python.exe"

if (-not (Test-Path $backendPy)) {
    Write-Host "[ERROR] Backend virtual environment not found at backend\.venv!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Starting Backend (http://127.0.0.1:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; & '$backendPy' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

Write-Host "[2/2] Starting Frontend (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "VoiceBridge is running!" -ForegroundColor Green
Write-Host "- Frontend UI: http://localhost:5173" -ForegroundColor Green
Write-Host "- Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
