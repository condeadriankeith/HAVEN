#!/bin/bash

echo "Starting HAVEN Pet Emergency Response System (Pure React Ecosystem)..."

# Start backend in background
echo "Starting backend API server..."
cd HAVEN
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start React web console
echo "Starting React Web Responder Console..."
cd web
npm run dev &
WEB_PID=$!
cd ..

# Start mobile app
echo "Starting mobile application..."
cd mobile
npx expo start &
MOBILE_PID=$!
cd ..

echo "All HAVEN components started!"
echo "Backend PID: $BACKEND_PID (http://localhost:3000)"
echo "Web Console PID: $WEB_PID (http://localhost:5173)"
echo "Mobile App PID: $MOBILE_PID (http://localhost:19006)"

# Wait for processes to complete
wait $BACKEND_PID
wait $WEB_PID
wait $MOBILE_PID