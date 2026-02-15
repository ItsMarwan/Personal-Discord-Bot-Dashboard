@echo off
echo Starting Discord Bot Dashboard...
echo.

REM
if not exist .env (
    echo Error: .env file not found!
    echo Please copy .env.example to .env and configure it:
    echo   copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

REM
echo Validating configuration...
node validate-setup.js
if errorlevel 1 (
    echo.
    echo Setup validation failed. Please fix the errors above.
    pause
    exit /b 1
)

echo Starting bot and dashboard...
echo.
echo Dashboard will be available at: http://localhost:3000
echo Bot API running on: http://localhost:3001
echo.
echo First time? It may take 30 seconds to fetch all members from Discord.
echo Tip: Wait for 'Cached X members' message before opening dashboard
echo.
echo Press Ctrl+C to stop
echo.

npm run dev