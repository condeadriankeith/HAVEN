@echo off
setlocal enabledelayedexpansion

:: Check if a parameter was passed
if "%1"=="" goto :main_menu
if "%1"=="--test-desktop-alerts" goto :test_desktop_alerts
if "%1"=="--simulate-mobile-alert" goto :simulate_mobile_alert
if "%1"=="--test-animation" goto :test_animation

:main_menu
echo ========================================
echo HAVEN Pet Emergency Response System
echo ========================================
echo Select an option:
echo 1. Start all components (default)
echo 2. Test desktop alert reception
echo 3. Simulate mobile emergency alert
echo 4. Test animation functionality
echo 5. Exit
echo ========================================
choice /c 12345 /m "Enter your choice"
if errorlevel 5 goto :exit
if errorlevel 4 goto :test_animation
if errorlevel 3 goto :simulate_mobile_alert
if errorlevel 2 goto :test_desktop_alerts
if errorlevel 1 goto :start_all_components

:start_all_components
echo ========================================
echo HAVEN Pet Emergency Response System
echo Starting all components...
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
    :: Check if this looks like a valid IPv4 address (contains dots)
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

:: Set environment variables for this session
set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000
set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000

:: Check if a process is already running on port 3000 and kill it
echo Checking for existing backend server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="" (
        echo Killing process %%a using port 3000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

:: Check if a process is already running on port 19006 (Expo default) and kill it
echo Checking for existing Expo server on port 19006...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19006') do (
    if not "%%a"=="" (
        echo Killing process %%a using port 19006...
        taskkill /PID %%a /F >nul 2>&1
    )
)

:: Check if a process is already running on port 19005 (Expo Metro bundler) and kill it
echo Checking for existing Expo Metro bundler on port 19005...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19005') do (
    if not "%%a"=="" (
        echo Killing process %%a using port 19005...
        taskkill /PID %%a /F >nul 2>&1
    )
)

:: Check if a process is already running on port 19004 (Expo dev tools) and kill it
echo Checking for existing Expo DevTools on port 19004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :19004') do (
    if not "%%a"=="" (
        echo Killing process %%a using port 19004...
        taskkill /PID %%a /F >nul 2>&1
    )
)

:: Initialize database files if they don't exist
echo Initializing database files...
if not exist "HAVEN\database" (
    mkdir "HAVEN\database"
)

:: Create database files with headers if they don't exist
if not exist "HAVEN\database\users.csv" (
    echo id,email,phone,firstName,lastName,address,role,password > "HAVEN\database\users.csv"
    echo USR-0001,admin@example.com,123-456-7890,Admin,User,"123 Main St",admin,"$2a$10$XrC4B8CGu97y4QqIg5b3X.wO/bh.BMbixWWpjhgW2s9uFCYDXOFMG" >> "HAVEN\database\users.csv"
)

if not exist "HAVEN\database\emergencies.csv" (
    echo emergencyId,userId,userName,userPhone,userEmail,latitude,longitude,address,emergencyType,status,reportedAt,respondedAt,resolvedAt,assignedResponderId,notes,createdAt,updatedAt > "HAVEN\database\emergencies.csv"
)

if not exist "HAVEN\database\responders.csv" (
    echo id,name,organization,phone,email,specialty,latitude,longitude,status,lastActive > "HAVEN\database\responders.csv"
)

echo [1/4] Starting backend API server...
cd HAVEN
start "HAVEN Backend" cmd /k "set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 && set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000 && npm run start"
cd ..

timeout /t 5 /nobreak >nul

echo [2/4] Starting desktop application...
cd desktop
:: Start the desktop app directly with Maven
start "HAVEN Desktop" cmd /k "set HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000 && mvn exec:java"
cd ..

timeout /t 5 /nobreak >nul

echo [3/4] Starting mobile application...
cd mobile
:: Clear Expo cache to ensure clean start
echo Clearing Expo cache...
rd /s /q ".expo" >nul 2>&1
:: Start the mobile app
start "HAVEN Mobile" cmd /k "set REACT_NATIVE_BACKEND_IP=http://%LOCAL_IP%:3000 && npx expo start"
cd ..

:: Generate QR code for mobile app access
echo Generating QR code for mobile app access...
node generate-qr.js

echo ========================================
echo All HAVEN components started successfully!
echo ========================================
echo Backend API:    http://%LOCAL_IP%:3000
echo Mobile App:     http://localhost:19006 (Expo DevTools)
echo Desktop App:    Started with Maven
echo Database:       HAVEN/database/ (CSV files)
echo ========================================
echo To access the mobile app:
echo   1. Install Expo Go on your phone
echo   2. Scan the QR code displayed in the generate-qr.js terminal
echo   3. Or use the Android/iOS simulator
echo ========================================
echo Press any key to exit this launcher...
pause >nul
goto :exit

:test_desktop_alerts
echo ========================================
echo Testing Desktop App Emergency Alert Reception
echo ========================================
echo This test will verify that the desktop app can receive emergency alerts
echo from the backend WebSocket server.
echo.
echo Make sure the backend server is running before proceeding.
echo.
pause
cd tests
node test-desktop-alert-reception.js
cd ..
echo.
echo Press any key to return to main menu...
pause >nul
goto :main_menu

:simulate_mobile_alert
echo ========================================
echo Simulating Mobile App Emergency Alert
echo ========================================
echo This script will simulate sending an emergency alert from the mobile app
echo to test the end-to-end alert flow.
echo.
echo Make sure the backend server is running before proceeding.
echo.
pause
cd tests
node simulate-mobile-alert.js
cd ..
echo.
echo Press any key to return to main menu...
pause >nul
goto :main_menu

:test_animation
echo ========================================
echo Testing Animation Functionality
echo ========================================
echo This test will verify that the animation files are correctly placed
echo and can be accessed by both the desktop and mobile applications.
echo.
pause
cd tests
node test-animation-file.js
cd ..
echo.
echo Press any key to return to main menu...
pause >nul
goto :main_menu

:exit
echo Exiting HAVEN system launcher...
exit /b 0