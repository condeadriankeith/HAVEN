@echo off
setlocal enabledelayedexpansion

echo ========================================
echo HAVEN Pet Emergency Response System
echo Initializing all components...
echo ========================================

:: Check if running from the correct directory
if not exist "HAVEN\server.js" (
    echo ERROR: Please run this script from the main HAVEN project directory
    pause
    exit /b 1
)

:: Get the computer's IP address automatically (IPv4 only)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4 Address"') do (
    set FULL_IP=%%a
    set FULL_IP=!FULL_IP:~1!
    echo !FULL_IP! | findstr "\." >nul
    if not errorlevel 1 (
        set LOCAL_IP=!FULL_IP!
        goto :found_ip
    )
)
:found_ip

if "%LOCAL_IP%"=="" (
    echo WARNING: Could not automatically detect IP address. Using localhost.
    set LOCAL_IP=localhost
)
echo Detected server IP: %LOCAL_IP%

:: Create .env files with the detected IP
echo Creating environment configuration files...
if not exist "mobile\.env" (
    echo REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 > "mobile\.env"
    echo Environment file created for mobile app
) else (
    echo Updating mobile app environment file...
    echo REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 > "mobile\.env"
)

if not exist "web\.env" (
    echo VITE_API_URL=http://localhost:3000 > "web\.env"
    echo VITE_SOCKET_URL=http://localhost:3000 >> "web\.env"
    echo Environment file created for web console
) else (
    echo Updating web console environment file...
    echo VITE_API_URL=http://localhost:3000 > "web\.env"
    echo VITE_SOCKET_URL=http://localhost:3000 >> "web\.env"
)

echo [1/3] Setting up backend API server...
cd HAVEN
if exist "node_modules" (
    echo   Node modules already installed, skipping...
) else (
    echo   Installing Node.js dependencies...
    npm install
    if !errorlevel! neq 0 (
        echo   ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo [2/3] Setting up React Web Responder Console...
cd web
if exist "node_modules" (
    echo   Web dependencies already installed, skipping...
) else (
    echo   Installing React Web dependencies...
    npm install
    if !errorlevel! neq 0 (
        echo   ERROR: Failed to install web dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo [3/3] Setting up mobile application...
cd mobile
if exist "node_modules\@expo\cli" (
    echo   Mobile dependencies already installed, skipping...
) else (
    echo   Installing React Native dependencies (including Expo CLI)...
    npm install
    if !errorlevel! neq 0 (
        echo   ERROR: Failed to install mobile dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo Initializing database...
cd HAVEN
if not exist "database" (
    mkdir "database"
)

if not exist "database\users.csv" (
    echo   Creating users.csv...
    echo id,email,phone,firstName,lastName,address,role,password > "database\users.csv"
    echo USR-0001,admin@example.com,123-456-7890,Admin,User,"123 Main St",admin,"$2a$10$XrC4B8CGu97y4QqIg5b3X.wO/bh.BMbixWWpjhgW2s9uFCYDXOFMG" >> "database\users.csv"
)

if not exist "database\emergencies.csv" (
    echo   Creating emergencies.csv...
    echo emergencyId,userId,userName,userPhone,userEmail,userPets,latitude,longitude,address,emergencyType,status,reportedAt,respondedAt,resolvedAt,assignedResponderId,notes,createdAt,updatedAt > "database\emergencies.csv"
)

if not exist "database\responders.csv" (
    echo   Creating responders.csv...
    echo id,name,organization,phone,email,specialty,latitude,longitude,status,lastActive > "database\responders.csv"
)
cd ..

echo ========================================
echo HAVEN initialization completed successfully!
echo ========================================
echo To start the system, run:
echo   Windows: run.bat
echo   macOS/Linux: ./run.sh
echo ========================================
pause