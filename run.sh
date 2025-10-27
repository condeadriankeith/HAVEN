#!/bin/bash

echo "Starting HAVEN Pet Emergency Response System..."

# Start backend in background
echo "Starting backend API server..."
cd HAVEN
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start mobile app
echo "Starting mobile application..."
cd mobile
npx expo start &
MOBILE_PID=$!
cd ..

# Start desktop app using our unified script
echo "Starting desktop application..."
cd desktop
./run.sh &
DESKTOP_PID=$!
cd ..

echo "All HAVEN components started!"
echo "Backend PID: $BACKEND_PID"
echo "Mobile App PID: $MOBILE_PID"
echo "Desktop App PID: $DESKTOP_PID"

# Wait for processes to complete
wait $BACKEND_PID
wait $MOBILE_PID
wait $DESKTOP_PID