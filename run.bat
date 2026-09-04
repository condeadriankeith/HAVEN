@echo off
setlocal enabledelayedexpansion

:: Check if a parameter was passed
if "%1"=="" goto :main_menu
if "%1"=="--test-web-integration" goto :test_web_integration
if "%1"=="--simulate-mobile-alert" goto :simulate_mobile_alert
if "%1"=="--test-animation" goto :test_animation

:main_menu
echo ========================================
echo HAVEN Pet Emergency Response System
echo ========================================
echo Select an option:
echo 1. Start all components (Backend, Web Console, Mobile)
echo 2. Start Web Console and Backend only
echo 3. Run React Web Integration Test
echo 4. Simulate mobile emergency alert
echo 5. Exit
echo ========================================
choice /c 12345 /m "Enter your choice"
if errorlevel 5 goto :exit
if errorlevel 4 goto :simulate_mobile_alert
if errorlevel 3 goto :test_web_integration
if errorlevel 2 goto :start_web_backend
if errorlevel 1 goto :start_all_components

:start_all_components
echo ========================================
echo HAVEN Pet Emergency Response System
echo Starting all components...
echo ========================================

call :detect_ip
call :kill_ports
call :init_db

echo [1/3] Starting backend API server...
cd HAVEN
start "HAVEN Backend" cmd /k "set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 && set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000 && npm run start"
cd ..

timeout /t 4 /nobreak >nul

echo [2/3] Starting React Web Responder Console...
cd web
start "HAVEN Web Console" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

echo [3/3] Starting mobile application...
cd mobile
echo Clearing Expo cache...
rd /s /q ".expo" >nul 2>&1
start "HAVEN Mobile" cmd /k "set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 && npx expo start"
cd ..

echo Generating QR code for mobile app access...
node generate-qr.js

echo ========================================
echo All HAVEN components started successfully!
echo ========================================
echo Backend API:    http://%LOCAL_IP%:3000
echo Web Console:    http://localhost:5173
echo Mobile App:     http://localhost:19006 (Expo DevTools)
echo Database:       HAVEN/database/ (CSV files)
echo ========================================
echo Press any key to exit this launcher...
pause >nul
goto :exit

:start_web_backend
echo ========================================
echo Starting Backend and Web Console...
echo ========================================
call :detect_ip
call :kill_ports
call :init_db

echo [1/2] Starting backend API server...
cd HAVEN
start "HAVEN Backend" cmd /k "set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 && set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000 && npm run start"
cd ..

timeout /t 4 /nobreak >nul

echo [2/2] Starting React Web Responder Console...
cd web
start "HAVEN Web Console" cmd /k "npm run dev"
cd ..

echo ========================================
echo System running!
echo Backend API:    http://%LOCAL_IP%:3000
echo Web Console:    http://localhost:5173
echo ========================================
pause >nul
goto :exit

:detect_ip
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
set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000
set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000
exit /b 0

:kill_ports
echo Checking for existing processes on ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="" taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    if not "%%a"=="" taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19006') do (
    if not "%%a"=="" taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19005') do (
    if not "%%a"=="" taskkill /PID %%a /F >nul 2>&1
)
exit /b 0

:init_db
echo Initializing database files...
if not exist "HAVEN\database" mkdir "HAVEN\database"
if not exist "HAVEN\database\users.csv" (
    echo id,email,phone,firstName,lastName,address,role,password > "HAVEN\database\users.csv"
    echo USR-0001,admin@example.com,123-456-7890,Admin,User,"123 Main St",admin,"$2a$10$G54sq85aYb484xKVawJfSOo5Lbop8/NywuR4ODvM9YKuo.HCaKQ8y" >> "HAVEN\database\users.csv"
)
if not exist "HAVEN\database\emergencies.csv" (
    echo emergencyId,userId,userName,userPhone,userEmail,userPets,latitude,longitude,address,emergencyType,status,reportedAt,respondedAt,resolvedAt,assignedResponderId,notes,createdAt,updatedAt > "HAVEN\database\emergencies.csv"
)
if not exist "HAVEN\database\responders.csv" (
    echo id,name,organization,phone,email,specialty,latitude,longitude,status,lastActive > "HAVEN\database\responders.csv"
)
exit /b 0

:test_web_integration
echo ========================================
echo Running React Web Integration Test
echo ========================================
echo Make sure the backend server is running on port 3000.
echo.
pause
node tests/test-react-web-integration.js
echo.
echo Press any key to return to main menu...
pause >nul
goto :main_menu

:simulate_mobile_alert
echo ========================================
echo Simulating Mobile App Emergency Alert
echo ========================================
pause
node tests/simulate-mobile-alert.js
echo.
echo Press any key to return to main menu...
pause >nul
goto :main_menu

:exit
echo Exiting HAVEN system launcher...
exit /b 0