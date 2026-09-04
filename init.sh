#!/bin/bash

echo "Initializing HAVEN Pet Emergency Response System (Pure React Ecosystem)..."

# Initialize backend
echo "Setting up backend API server..."
cd HAVEN
npm install
cd ..

# Initialize web console
echo "Setting up React Web Responder Console..."
cd web
npm install
cd ..

# Initialize mobile app
echo "Setting up mobile application..."
cd mobile
npm install
cd ..

echo "All components initialized successfully!"
echo ""
echo "To start the system:"
echo "1. Start all components: ./run.sh"
echo "2. Or manually:"
echo "   Backend: cd HAVEN && npm start"
echo "   Web Console: cd web && npm run dev"
echo "   Mobile App: cd mobile && npx expo start"