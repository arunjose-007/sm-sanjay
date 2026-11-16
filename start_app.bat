@echo off
TITLE Launch Intelligent Assistant - Full Stack
COLOR 0A

echo =====================================================================
echo   Starting Intelligent Assistant for Livelihood and Road Safety
echo =====================================================================
echo.

:: Launch Backend
echo [1/2] Starting Flask Backend on http://localhost:5000 ...
start "Intelligent Assistant Backend" cmd /k "cd /d %~dp0backend && python run.py"

:: Launch Frontend
echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "Intelligent Assistant Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo Services starting in separate windows!
echo - React Frontend: http://localhost:5173
echo - Flask Backend API: http://localhost:5000
echo.
echo For Offline Local AI, run in another terminal:
echo   ollama run llama3.2:3b
echo =====================================================================
timeout /t 5
start http://localhost:5173
