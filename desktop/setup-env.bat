@echo off
echo Setting up environment for HAVEN Desktop Application...

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

:: Create .env file with the detected IP
echo Creating environment configuration file...
echo HAVEN_BACKEND_URL=http://%LOCAL_IP%:3000 > .env
echo Environment file created with backend URL: http://%LOCAL_IP%:3000

echo.
echo JAVA_HOME=%JAVA_HOME%
echo MAVEN_HOME=%MAVEN_HOME%
echo.
echo Make sure you have Java 17+ and Maven installed.
echo If you encounter issues, please verify your JAVA_HOME and MAVEN_HOME environment variables.
pause