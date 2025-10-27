@echo off
echo Building HAVEN Desktop Application...
cd /d "%~dp0"
mvn clean compile
echo Build completed.
pause