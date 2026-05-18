@echo off
title IPM360 DEBUG
set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

echo ==========================================
echo       MODO DEBUG - IPM360
echo ==========================================

echo [1/3] Iniciando Backend...
start "Backend" cmd /k "cd backend && npm start"

echo [2/3] Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Aguardando inicializacao...
timeout /t 10

echo Abrindo Chrome...
start chrome http://localhost:5173

echo Verifique se ha erros nas outras janelas pretas que abriram.
pause
