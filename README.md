# HAVEN Pet Emergency Response System

## Overview

HAVEN is an integrated pet emergency response system that connects pet owners with emergency services, veterinarians, and rescue organizations in real time. The system consists of three main components:

1. **Backend API Server** (Node.js/Express) - Handles user authentication, emergency alerts, and real-time monitoring
2. **Mobile Application** (React Native/Expo) - One-tap emergency alerting for pet owners
3. **Desktop Application** (Java Swing) - Dashboard for emergency responders

## System Requirements

- Node.js 18.x or later
- Java JDK 17 or later
- Apache Maven 3.9.x
- Expo CLI installed globally (`npm install -g expo-cli`)

## Quick Start

### 1. Initialize the System

Run the initialization script to set up the environment:

```bash
# On Windows
init.bat

# On macOS/Linux
./init.sh
```

### 2. Start All Components

Run the main startup script to launch all system components:

```bash
# On Windows
run.bat

# On macOS/Linux
./run.sh
```

This will start:
- Backend API server on port 3000
- Mobile development server
- Desktop application

### 3. Access the Applications

1. **Backend API**: http://localhost:3000
2. **Mobile App**: Scan the QR code in the Expo terminal or use an emulator
3. **Desktop App**: The Java Swing application will open automatically

## Component Details

### Backend API Server

The backend is built with Node.js and Express, providing RESTful APIs under `/api/v1/`.

**Key Features:**
- JWT-based authentication
- Real-time WebSocket communication
- CSV-based data persistence
- Emergency alert management

**API Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users/profile` - User profile retrieval
- `POST /api/v1/emergencies/alert` - Create emergency alert
- `GET /api/v1/emergencies/active` - Get active emergencies

### Mobile Application

The mobile app is built with React Native and Expo, providing a cross-platform solution for pet owners.

**Key Features:**
- One-tap emergency alerting
- Location services integration
- Real-time emergency status updates via WebSocket
- User authentication

### Desktop Application

The desktop app is built with Java Swing, providing a dashboard for emergency responders.

**Key Features:**
- Real-time incident view
- Emergency status management
- Map visualization
- WebSocket-based real-time updates

## Database Structure

The system uses CSV files for data persistence, stored in the `HAVEN/database` directory:

- `users.csv` - User account information
- `emergencies.csv` - Emergency alert records
- `responders.csv` - Emergency responder information

## Real-Time Communication

The system implements real-time bidirectional communication using:
- WebSocket for push updates (real-time notifications)
- REST API for pull requests (data synchronization)

## Default Credentials

For testing purposes, the system includes a default admin account:
- **Email**: admin@example.com
- **Password**: admin123

## Troubleshooting

### Mobile App Connection Issues

If the mobile app cannot connect to the backend:
1. Ensure all components are running
2. Check that your mobile device and computer are on the same network
3. Verify the backend IP address in `mobile/services/api.js`

### Desktop App Issues

If the desktop app fails to start:
1. Ensure Java JDK 17+ is installed and in your PATH
2. Verify Maven is properly configured
3. Check the console output for specific error messages

## Development

### Backend Development

To run the backend in development mode with auto-reload:

```bash
cd HAVEN
npm run dev
```

### Mobile Development

To run the mobile app with Expo:

```bash
cd mobile
npx expo start
```

### Desktop Development

To run the desktop app:

```bash
cd desktop
mvn exec:java
```

## Testing

To run the real-time synchronization tests:

```bash
node test-realtime-sync.js
```

## Architecture

The system follows a three-tier architecture:
1. **Presentation Layer**: Mobile and desktop applications
2. **Logic Layer**: Backend API server
3. **Data Layer**: CSV-based persistence

All components communicate through the central backend API, with real-time updates propagated via WebSocket connections.