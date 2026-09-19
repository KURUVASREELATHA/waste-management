@echo off
echo Starting EcoWaste Development Server for Mobile...
echo.
echo Server will be available at:
echo - Local: http://localhost:5176
echo - Network: http://192.168.164.137:5176
echo - QR Scanner: http://192.168.164.137:5176/qr-scanner
echo - Mobile Test: http://192.168.164.137:5176/mobile-qr-test.html
echo.
echo Make sure your mobile device is on the same WiFi network!
echo.
pause
npm run dev:mobile