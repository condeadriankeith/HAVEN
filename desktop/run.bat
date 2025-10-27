@echo off
echo Starting HAVEN Desktop Application...
cd /d "%~dp0"
mvn javafx:run
pause