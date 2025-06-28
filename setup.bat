@echo off
echo Setting up Unsplash MCP Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are installed. Continuing setup...

REM Install dependencies
echo Installing dependencies...
npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
)

REM Build the project
echo Building the project...
npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to build the project
    pause
    exit /b 1
)

REM Run tests
echo Running tests...
npm test
if %ERRORLEVEL% neq 0 (
    echo Warning: Some tests failed, but continuing...
)

echo.
echo ✅ Setup completed successfully!
echo.
echo To test the scraper, run: npm run test:scraper
echo To start the server, run: npm start
echo To run in development mode, run: npm run dev
echo.
pause
