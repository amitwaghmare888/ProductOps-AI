# ProductOps AI — Windows Startup Script
# Run from: productops-ai/ directory
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ProductOps AI — Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check .env exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found." -ForegroundColor Red
    Write-Host "Run:  copy .env.example .env" -ForegroundColor Yellow
    Write-Host "Then: Add your GOOGLE_API_KEY to .env" -ForegroundColor Yellow
    exit 1
}

# Check GOOGLE_API_KEY is set
$envContent = Get-Content ".env" | Where-Object { $_ -match "^GOOGLE_API_KEY=" }
if (-not $envContent -or $envContent -eq "GOOGLE_API_KEY=your_gemini_api_key_here") {
    Write-Host "ERROR: GOOGLE_API_KEY not set in .env" -ForegroundColor Red
    Write-Host "Get your key from: https://aistudio.google.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Backend (FastAPI)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    uvicorn backend.main:app --reload --port 8000
}

Start-Sleep -Seconds 3

Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    npm run dev
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services running:" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Gray
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        # Print any new output from jobs
        Receive-Job $backendJob -ErrorAction SilentlyContinue | Write-Host -ForegroundColor DarkGray
        Receive-Job $frontendJob -ErrorAction SilentlyContinue | Write-Host -ForegroundColor DarkGray
    }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Green
}
