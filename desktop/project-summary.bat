@echo off
REM HAVEN Desktop Project Summary Script

echo === HAVEN Desktop Application Summary ===
echo.

echo Project Structure:
echo ------------------
dir /s /b | findstr /v /c:"target" | findstr /v /c:".git" | findstr /v /c:"node_modules"

echo.
echo Build Status:
echo -------------
if exist "target\haven-desktop-1.0-SNAPSHOT.jar" (
    echo ✅ JAR file successfully created
    for %%A in ("target\haven-desktop-1.0-SNAPSHOT.jar") do (
        echo    Size: %%~zA bytes
    )
) else (
    echo ❌ JAR file not found
)

echo.
echo Java Source Files:
echo ------------------
dir /b src\main\java\com\haven\

echo.
echo Resources:
echo ----------
dir /b src\main\resources\

echo.
echo === Summary Complete ===