@echo off
echo Starting Interview Practice Development Environment...

echo.
echo Starting FastAPI Backend...
start "Backend" cmd /k "cd backend && python start.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Next.js Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo Development environment started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
