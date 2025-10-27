@echo off
echo Starting HAVEN Pet Emergency Response System...

echo Starting backend API server...
cd HAVEN
start "HAVEN Backend" npm start
cd ..

timeout /t 3 /nobreak >nul

echo Starting mobile application...
cd mobile
start "HAVEN Mobile" npx expo start
cd ..

echo Starting desktop application...
cd desktop
start "HAVEN Desktop" run.bat
cd ..

echo All HAVEN components started!
echo Please check each application window to ensure they are running properly.
pause