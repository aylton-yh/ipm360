@echo off
title IPM360 DEBUG
set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%..
set PROJECT_DIR=%CD%\

echo ==========================================
echo       MODO DEBUG - IPM360
echo ==========================================

echo [1/3] Iniciando Backend...
start "Backend" cmd /k "cd /d \"%PROJECT_DIR%backend\" && npm start"

echo [2/3] Iniciando Frontend...
start "Frontend" cmd /k "cd /d \"%PROJECT_DIR%frontend\" && npm run dev"

echo [3/3] Aguardando inicializacao...
timeout /t 10

echo Abrindo Chrome...
start chrome http://localhost:5173

echo Verifique se ha erros nas outras janelas pretas que abriram.
pause
