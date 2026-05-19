@echo off
title IPM360 Launcher
set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%..
set PROJECT_DIR=%CD%\

echo ==========================================
echo       INICIANDO SISTEMA IPM360
echo ==========================================

:: 1. Tentar iniciar o MySQL do XAMPP se nao estiver rodando
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo [1/4] Iniciando MySQL do XAMPP...
    start /b "" "C:\xampp\mysql\bin\mysqld.exe"
    timeout /t 2 /nobreak > NUL
) else (
    echo [1/4] MySQL ja esta em execucao.
)

:: 2. Iniciar o Backend em background
echo [2/4] Iniciando Servidor Backend...
wscript.exe "%SCRIPT_DIR%silenciar_janelas.vbs" "cmd.exe /c cd /d \"%PROJECT_DIR%backend\" && npm start"

:: 3. Iniciar o Frontend em background
echo [3/4] Iniciando Servidor Frontend...
wscript.exe "%SCRIPT_DIR%silenciar_janelas.vbs" "cmd.exe /c cd /d \"%PROJECT_DIR%frontend\" && npm run dev"

:: 4. Abrir o Chrome
echo [4/4] Abrindo IPM360 no Chrome...
timeout /t 5 /nobreak > NUL
start chrome --app=http://localhost:5173

echo.
echo Tudo pronto! O sistema abrira em instantes.
echo Ja pode fechar esta janela.
timeout /t 3 > NUL
exit
