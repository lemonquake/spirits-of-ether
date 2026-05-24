@echo off
setlocal
title Spirits of Ether - Launcher
color 0F

:: Navigate to script directory
cd /d "%~dp0"

echo.
echo    ╔═══════════════════════════════════════════════════════════╗
echo    ║                                                           ║
echo    ║           ⚗  S P I R I T S   O F   E T H E R  ⚗          ║
echo    ║                                                           ║
echo    ╚═══════════════════════════════════════════════════════════╝
echo.

:: 1. Check if local portable Node.js exists
if exist ".node\node.exe" goto node_exists

echo    [1/3] Local Node.js environment not found.
echo          Downloading portable runtime environment (approx. 30MB)...
echo          Please wait, this setup only runs once.
echo.

:: Use PowerShell to download Node.js v22.12.0 zip
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip' -OutFile 'node_portable.zip'"
if errorlevel 1 goto download_failed

echo          Extracting environment files...
powershell -Command "Expand-Archive -Path 'node_portable.zip' -DestinationPath 'node_temp'"
if errorlevel 1 goto extract_failed

:: Move extracted files to .node directory
if not exist ".node" mkdir ".node"
xcopy /e /y "node_temp\node-v22.12.0-win-x64\*" ".node\" >nul

:: Clean up temporary download files
del /f /q node_portable.zip >nul 2>&1
rmdir /s /q node_temp >nul 2>&1

echo          Local Node.js environment configured successfully! ✓
echo.

:node_exists
:: 2. Prepend local portable Node.js to PATH
set "PATH=%~dp0.node;%PATH%"

:: Verify local Node execution
node -v >nul 2>&1
if errorlevel 1 goto node_execution_failed

:: 3. Install NPM dependencies if node_modules doesn't exist
echo    [2/3] Verifying game requirements...
if exist "node_modules\" goto deps_exist

echo          Game requirements not found. Installing dependencies...
echo          This may take a minute. Please keep this window open.
echo.
call npm install
if errorlevel 1 goto install_failed
echo.
echo          Dependencies installed successfully! ✓

:deps_exist
echo          Dependencies are ready. ✓
echo.

:: 4. Start the game server
echo    [3/3] Starting Spirits of Ether...
echo.
echo    ═══════════════════════════════════════════════════════════
echo      The game will automatically open in your default browser.
echo      If it doesn't, navigate to:  http://127.0.0.1:5173/
echo.
echo      Keep this console window open while playing.
echo      Press Ctrl+C here to shutdown the game server.
echo    ═══════════════════════════════════════════════════════════
echo.

:: Open browser after a short delay and launch Vite dev server
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:5173"
call npm run dev
goto end

:download_failed
echo.
echo    ERROR: Failed to download Node.js. Check your internet connection.
pause
exit /b 1

:extract_failed
echo.
echo    ERROR: Failed to extract environment files.
del /f /q node_portable.zip >nul 2>&1
pause
exit /b 1

:node_execution_failed
echo.
echo    ERROR: Local Node.js was configured but failed to execute.
pause
exit /b 1

:install_failed
echo.
echo    ERROR: Failed to install game requirements.
pause
exit /b 1

:end
