# Start backend server
Write-Host "Starting Interview Practice Backend API..." -ForegroundColor Green
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
