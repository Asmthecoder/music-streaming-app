@echo off
echo Installing MusicStream Project Dependencies...
echo.
echo This will install all required npm packages.
echo Please wait...
echo.

cd /d "%~dp0"
call npm install

echo.
echo Installation complete!
echo.
echo To start the server, run: npm start
echo.
pause
