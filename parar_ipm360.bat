@echo off
title Encerrar IPM360
echo ==========================================
echo       ENCERRANDO SISTEMA IPM360
echo ==========================================

echo Parando processos do Node.js (Backend e Frontend)...
taskkill /F /IM node.exe /T

echo Parando MySQL...
:: Tentativa de parar o MySQL de forma limpa via XAMPP se possivel, ou forcar se necessario
taskkill /F /IM mysqld.exe

echo.
echo Sistema encerrado com sucesso.
timeout /t 3
exit
