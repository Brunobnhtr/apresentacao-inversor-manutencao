@echo off
title Apresentacao Industrial - Servidor
echo.
echo ==========================================
echo   Iniciando apresentacao...
echo ==========================================
echo.
cd /d "%~dp0"

:: Build para producao se necessario
if not exist "dist\index.html" (
  echo Construindo arquivos...
  call npm run build
)

echo Iniciando servidor...
echo.
node server.js
pause
