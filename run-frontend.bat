@echo off
cd /d "%~dp0"
call npm run dev > "%TEMP%\wastewise-vite.log" 2>&1
