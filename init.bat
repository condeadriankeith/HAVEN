@echo off
echo Initializing HAVEN Pet Emergency Response System...

echo Setting up backend API server...
cd HAVEN
npm install
cd ..

echo Setting up mobile application...
cd mobile
npm install
cd ..

echo Setting up desktop application...
cd desktop
call setup-env.bat
mvn clean install
cd ..

echo All components initialized successfully!
echo.
echo To start the system:
echo 1. Start the backend: cd HAVEN && npm start
echo 2. Start the mobile app: cd mobile && npx expo start
echo 3. Start the desktop app: cd desktop && run.bat
pause