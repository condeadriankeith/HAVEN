#!/bin/bash

echo "Initializing HAVEN Pet Emergency Response System..."

# Initialize backend
echo "Setting up backend API server..."
cd HAVEN
npm install
cd ..

# Initialize mobile app
echo "Setting up mobile application..."
cd mobile
npm install
cd ..

# Initialize desktop app
echo "Setting up desktop application..."
cd desktop
# Note: For Linux/Mac, you may need to manually set JAVA_HOME and M2_HOME
mvn clean install
cd ..

echo "All components initialized successfully!"
echo ""
echo "To start the system:"
echo "1. Start the backend: cd HAVEN && npm start"
echo "2. Start the mobile app: cd mobile && npx expo start"
echo "3. Start the desktop app: cd desktop && ./run.sh"