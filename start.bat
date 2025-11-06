@echo off
echo Starting MusicStream Server...
echo.
echo Make sure MongoDB is running!
echo.

cd /d "%~dp0"
call npm start

pause
