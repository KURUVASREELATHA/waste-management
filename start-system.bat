@echo off
echo Starting WasteWise System with Data Persistence...
echo.

echo [1/3] Starting Backend Server...
cd backend
start "WasteWise Backend" cmd /k "npm start"
cd ..

echo [2/3] Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo [3/3] Starting Frontend Development Server...
start "WasteWise Frontend" cmd /k "npm run dev"

echo.
echo ✅ WasteWise System Started Successfully!
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul