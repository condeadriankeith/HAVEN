@echo off
echo Starting HAVEN Desktop Application...
cd /d "%~dp0"
mvn exec:java
pause