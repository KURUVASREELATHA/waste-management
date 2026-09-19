@echo off
echo Starting Waste Wise Development Environment...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm install && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause