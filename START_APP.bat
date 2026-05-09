@echo off
title Margin AI - Starting...
color 0A

echo.
echo  ================================================
echo   Margin AI - Starting Backend + Frontend
echo  ================================================
echo.

cd /d "%~dp0"

:: ── Backend ───────────────────────────────────────────
echo  [1/2] Starting Backend (FastAPI on port 8000)...
taskkill /F /IM python.exe /T >nul 2>&1
start "Margin AI - Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait for backend to bind
timeout /t 4 /nobreak >nul

:: ── Frontend ──────────────────────────────────────────
echo  [2/2] Starting Frontend (Vite on port 5173)...
taskkill /F /IM node.exe /T >nul 2>&1
start "Margin AI - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait for Vite to start
timeout /t 6 /nobreak >nul

:: ── Open browser ─────────────────────────────────────
echo.
echo  Opening app at http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo  ================================================
echo   Both servers running!
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:5173
echo.
echo   Keep both terminal windows open.
echo   Close them to stop the app.
echo  ================================================
echo.
pause
