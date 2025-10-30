@echo off
setlocal enabledelayedexpansion

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
    echo id,userId,type,severity,description,status,latitude,longitude,address,createdAt,updatedAt > "HAVEN\database\emergencies.csv"
)

if not exist "HAVEN\database\responders.csv" (
    echo id,name,organization,phone,email,specialty,latitude,longitude,status,lastActive > "HAVEN\database\responders.csv"
)

echo [1/4] Starting backend API server...
cd HAVEN
start "HAVEN Backend" cmd /k "npm run start"
cd ..

timeout /t 5 /nobreak >nul

echo [2/4] Starting desktop application...
cd desktop
start "HAVEN Desktop" cmd /k "mvn exec:java"
cd ..

timeout /t 5 /nobreak >nul

echo [3/4] Starting mobile application...
cd mobile
start "HAVEN Mobile" cmd /k "npx expo start"
cd ..

echo ========================================
echo All HAVEN components started successfully!
echo ========================================
echo Backend API:    http://localhost:3000
echo Mobile App:     http://localhost:19006 (Expo DevTools)
echo Desktop App:    Started with Maven
echo Database:       HAVEN/database/ (CSV files)
echo ========================================
echo To access the mobile app:
echo   1. Install Expo Go on your phone
echo   2. Scan the QR code in the Expo terminal
echo   3. Or use the Android/iOS simulator
echo ========================================
echo Press any key to exit this launcher...
pause >nul
exit