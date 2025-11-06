@echo off
echo.
echo ========================================
echo   MusicStream - Project File Checker
echo ========================================
echo.

cd /d "%~dp0"

echo Checking project structure...
echo.

echo [Backend Files]
if exist "server.js" (echo [OK] server.js) else (echo [MISSING] server.js)
if exist "package.json" (echo [OK] package.json) else (echo [MISSING] package.json)
if exist ".env" (echo [OK] .env) else (echo [MISSING] .env)
echo.

echo [Models]
if exist "models\User.js" (echo [OK] models\User.js) else (echo [MISSING] models\User.js)
if exist "models\Playlist.js" (echo [OK] models\Playlist.js) else (echo [MISSING] models\Playlist.js)
echo.

echo [Routes]
if exist "routes\auth.js" (echo [OK] routes\auth.js) else (echo [MISSING] routes\auth.js)
if exist "routes\playlists.js" (echo [OK] routes\playlists.js) else (echo [MISSING] routes\playlists.js)
if exist "routes\music.js" (echo [OK] routes\music.js) else (echo [MISSING] routes\music.js)
echo.

echo [Frontend HTML]
if exist "public\index.html" (echo [OK] public\index.html) else (echo [MISSING] public\index.html)
if exist "public\login.html" (echo [OK] public\login.html) else (echo [MISSING] public\login.html)
if exist "public\register.html" (echo [OK] public\register.html) else (echo [MISSING] public\register.html)
if exist "public\dashboard.html" (echo [OK] public\dashboard.html) else (echo [MISSING] public\dashboard.html)
echo.

echo [Frontend CSS]
if exist "public\css\styles.css" (echo [OK] public\css\styles.css) else (echo [MISSING] public\css\styles.css)
echo.

echo [Frontend JavaScript]
if exist "public\js\index.js" (echo [OK] public\js\index.js) else (echo [MISSING] public\js\index.js)
if exist "public\js\login.js" (echo [OK] public\js\login.js) else (echo [MISSING] public\js\login.js)
if exist "public\js\register.js" (echo [OK] public\js\register.js) else (echo [MISSING] public\js\register.js)
if exist "public\js\dashboard.js" (echo [OK] public\js\dashboard.js) else (echo [MISSING] public\js\dashboard.js)
echo.

echo [Documentation]
if exist "README.md" (echo [OK] README.md) else (echo [MISSING] README.md)
if exist "QUICKSTART.md" (echo [OK] QUICKSTART.md) else (echo [MISSING] QUICKSTART.md)
echo.

echo ========================================
echo   Checking Dependencies...
echo ========================================
echo.

if exist "node_modules" (
    echo [OK] node_modules folder exists
    echo Dependencies appear to be installed
) else (
    echo [WARNING] node_modules folder not found
    echo Please run: install.bat
    echo Or: npm install
)
echo.

echo ========================================
echo   Checking MongoDB
echo ========================================
echo.

sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB service found
    sc query MongoDB | find "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo [OK] MongoDB is RUNNING
    ) else (
        echo [WARNING] MongoDB is STOPPED
        echo Run: net start MongoDB
    )
) else (
    echo [INFO] MongoDB service not found
    echo You may be using MongoDB Atlas or manual installation
)
echo.

echo ========================================
echo   Checking Node.js
echo ========================================
echo.

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org/
)
echo.

where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm not found!
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo All checks complete!
echo.
echo Next steps:
echo 1. If dependencies not installed: run install.bat
echo 2. If MongoDB not running: start it
echo 3. Run start.bat to launch the server
echo 4. Open http://localhost:3000 in your browser
echo.

pause
