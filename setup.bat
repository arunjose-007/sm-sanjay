@echo off
TITLE Intelligent Assistant Setup
COLOR 0B

echo =====================================================================
echo   INTELLIGENT ASSISTANT FOR LIVELIHOOD AND ROAD SAFETY
echo   Workspace Automated Setup Script
echo =====================================================================
echo.

echo [1/4] Checking Python and Node.js...
python --version
node --version
echo.

echo [2/4] Setting up Backend Dependencies & SQLite Database...
cd /d "%~dp0backend"
pip install -r requirements.txt
python -c "from app import create_app; app = create_app(); print('Database initialized and seeded successfully in backend/instance/livelihood_safety.db!')"
echo.

echo [3/4] Installing Frontend Dependencies...
cd /d "%~dp0frontend"
call npm install
echo.

echo [4/4] Building Frontend Production Bundle...
call npm run build
echo.

echo =====================================================================
echo   SETUP COMPLETED! Everything is configured in this workspace.
echo =====================================================================
echo.
echo TO RUN IN THIS WORKSPACE:
echo - Run both services: double-click start_app.bat
echo - Or run Backend: run_backend.bat  (http://localhost:5000)
echo - Or run Frontend: run_frontend.bat (http://localhost:5173)
echo.
echo For Local Offline AI, start Ollama:
echo   ollama run llama3.2:3b
echo =====================================================================
pause
