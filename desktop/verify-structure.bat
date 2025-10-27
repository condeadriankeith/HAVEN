@echo off
REM HAVEN Desktop Application Verification Script

echo === HAVEN Desktop Application Verification ===
echo.

REM Check if Java is installed
echo Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    exit /b 1
)

REM Check if Maven is installed
echo.
echo Checking Maven installation...
mvn -version
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    exit /b 1
)

REM Check project structure
echo.
echo Checking project structure...
if not exist "src\main\java\com\haven" (
    echo ERROR: Java source directory not found
    exit /b 1
)

if not exist "pom.xml" (
    echo ERROR: pom.xml not found
    exit /b 1
)

REM List Java source files
echo.
echo Java source files:
dir /b src\main\java\com\haven\

REM Check if required classes exist
echo.
echo Checking required Java classes...
set REQUIRED_CLASSES=Main.java HavenDashboard.java CustomButton.java RoundedPanel.java MapPanel.java AlertPanel.java
for %%f in (%REQUIRED_CLASSES%) do (
    if not exist "src\main\java\com\haven\%%f" (
        echo ERROR: Required class %%f not found
        exit /b 1
    ) else (
        echo   ✓ %%f found
    )
)

REM Compile the project
echo.
echo Compiling the project...
mvn clean compile
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed
    exit /b 1
) else (
    echo   ✓ Compilation successful
)

REM Package the project
echo.
echo Packaging the project...
mvn package
if %errorlevel% neq 0 (
    echo ERROR: Packaging failed
    exit /b 1
) else (
    echo   ✓ Packaging successful
)

REM Check if JAR file was created
echo.
echo Checking JAR file...
if not exist "target\haven-desktop-1.0-SNAPSHOT.jar" (
    echo ERROR: JAR file not created
    exit /b 1
) else (
    echo   ✓ JAR file created successfully
    for %%A in ("target\haven-desktop-1.0-SNAPSHOT.jar") do (
        echo   JAR size: %%~zA bytes
    )
)

echo.
echo === Verification Complete ===
echo The HAVEN desktop application is ready to run!
echo.
echo To run the application, use one of the following commands:
echo   mvn javafx:run
echo   java -jar target/haven-desktop-1.0-SNAPSHOT.jar (after adding JavaFX modules)