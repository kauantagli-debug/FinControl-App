@echo off
cd /d "%~dp0"
echo Diretorio Atual: %CD%

if not exist whatsapp-bot (
    echo ERRO: Pasta whatsapp-bot nao encontrada!
    echo Certifique-se de que a pasta existe.
    pause
    exit /b
)

echo Entrando em whatsapp-bot...
cd whatsapp-bot

if not exist node_modules (
    echo Instalando dependencias (nao pule isso!)...
    call npm install
)

echo Iniciando Bot...
node index.js

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Ocorreu um erro ao rodar o Node.js.
    echo Verifique se o Node esta instalado e se o npm install rodou.
    pause
)

pause
