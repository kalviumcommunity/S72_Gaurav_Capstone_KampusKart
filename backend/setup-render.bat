@echo off
echo 🚀 Setting up KampusKart for Render deployment...

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if render.yaml exists
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please create it first.
    pause
    exit /b 1
)

REM Check if Procfile exists
if not exist "Procfile" (
    echo ❌ Error: Procfile not found. Please create it first.
    pause
    exit /b 1
)

echo ✅ All required files found!

REM Check package.json scripts
findstr /C:"\"start\"" package.json >nul
if %errorlevel% equ 0 (
    echo ✅ Start script found in package.json
) else (
    echo ❌ Error: No start script found in package.json
    pause
    exit /b 1
)

REM Check if server.js exists
if exist "server.js" (
    echo ✅ server.js found
) else (
    echo ❌ Error: server.js not found
    pause
    exit /b 1
)

REM Check if health endpoint exists
findstr /C:"/api/health" server.js >nul
if %errorlevel% equ 0 (
    echo ✅ Health check endpoint found
) else (
    echo ❌ Error: Health check endpoint not found in server.js
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete! Your backend is ready for Render deployment.
echo.
echo 📋 Next steps:
echo 1. Push your code to GitHub
echo 2. Go to https://dashboard.render.com
echo 3. Create a new Web Service
echo 4. Connect your GitHub repository
echo 5. Set the root directory to: S72_Gaurav_Capstone/backend
echo 6. Configure environment variables
echo 7. Deploy!
echo.
echo 📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md
pause 