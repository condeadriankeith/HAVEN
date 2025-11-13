# HAVEN Pet Emergency Response System

## Overview

HAVEN is an integrated pet emergency response system that connects pet owners with emergency services, veterinarians, and rescue organizations in real time. The system consists of three main components:

1. **Backend API Server** (Node.js/Express) - Handles user authentication, emergency alerts, and real-time monitoring
2. **Mobile Application** (React Native/Expo) - One-tap emergency alerting for pet owners
3. **Desktop Application** (Java Swing) - Dashboard for emergency responders

## Project Structure

```
HAVEN/
├── HAVEN/                 # Backend service (Node.js + Express)
│   ├── server.js          # Entry point
│   ├── websocketServer.js # WebSocket implementation
│   ├── csvHandler.js      # CSV data handling
│   └── database/          # CSV data files
├── mobile/                # React Native mobile app
│   ├── App.js             # Main application component
│   ├── screens/           # Screen components
│   ├── components/        # Reusable UI components
│   ├── services/          # API and location services
│   └── constants/         # Style and configuration constants
├── desktop/               # Java Swing desktop client
│   ├── src/               # Source code
│   ├── pom.xml            # Maven configuration
│   └── run.bat            # Execution script
├── docs/                  # Project documentation
├── tests/                 # Test and verification scripts
├── init.bat/init.sh       # Environment setup scripts
└── run.bat/run.sh         # Application startup scripts
```

## Emergency Reporting Workflow

1. **Pet Owner**: Uses mobile app to report emergency with one-tap alert
2. **Location Services**: Automatically captures current GPS coordinates
3. **Backend Processing**: Validates alert and stores in database
4. **Real-time Broadcast**: WebSocket pushes alert to all connected desktop clients
5. **Responder Action**: Emergency personnel view alert on dashboard and respond
6. **Status Updates**: Real-time status changes propagated to all stakeholders

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
- User profile management
- Emergency status tracking

**API Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users/profile` - User profile retrieval
- `POST /api/emergency/report` - Create emergency alert
- `GET /api/v1/emergencies/active` - Get active emergencies
- `PUT /api/v1/emergencies/:emergencyId` - Update emergency status

### Mobile Application

The mobile app is built with React Native and Expo, providing a cross-platform solution for pet owners.

**Key Features:**
- One-tap emergency alerting with [EmergencyButton](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/components/EmergencyButton.js#L5-L12)
- Location services integration with [Location API](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/services/location.js#L7-L42)
- Real-time emergency status updates via WebSocket
- User authentication and profile management
- Emergency history tracking
- Map visualization of emergency locations

**Key Screens:**
- [LoginScreen](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/screens/LoginScreen.js) - User authentication
- [HomeScreen](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/screens/HomeScreen.js) - Main dashboard with emergency button
- [ReportForm](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/screens/ReportForm.js) - Detailed emergency reporting
- [MapScreen](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/screens/MapScreen.js) - Emergency location visualization
- [ProfileScreen](file:///c%3A/Users/conde/Downloads/HAVEN/mobile/screens/ProfileScreen.js) - User profile management

### Desktop Application

The desktop app is built with Java Swing, providing a dashboard for emergency responders.

**Key Features:**
- Real-time incident view with [AlertPanel](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/AlertPanel.java#L23-L174)
- Emergency status management
- Interactive map visualization with [MapPanel](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/MapPanel.java#L27-L191)
- WebSocket-based real-time updates
- User management interface
- Analytics dashboard

**Main Components:**
- [HavenDashboard](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/HavenDashboard.java#L17-L491) - Main application window
- [WebSocketClient](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/WebSocketClient.java#L17-L229) - Real-time communication
- [ApiService](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/ApiService.java#L13-L165) - Backend API integration
- [CustomButton](file:///c%3A/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/CustomButton.java#L7-L57) - UI components

## Database Structure

The system uses CSV files for data persistence, stored in the `HAVEN/database` directory:

- `users.csv` - User account information
- `emergencies.csv` - Emergency alert records
- `responders.csv` - Emergency responder information

**Emergency Record Format:**
```
id,userId,userName,userPhone,userEmail,latitude,longitude,address,emergencyType,status,reportedAt,respondedAt,resolvedAt,assignedResponderId,notes,createdAt,updatedAt
```

## Real-Time Communication

The system implements real-time bidirectional communication using:
- WebSocket for push updates (real-time notifications)
- REST API for pull requests (data synchronization)

**Communication Flow:**
1. Mobile app sends emergency report via REST API
2. Backend validates and stores emergency
3. Backend broadcasts emergency via WebSocket
4. Desktop app receives WebSocket update
5. Status changes propagate back through WebSocket

## Default Credentials

For testing purposes, the system includes a default admin account:
- **Email**: admin@example.com
- **Password**: admin123

Additional test users:
- **Pet Owner**: test@example.com / test123
- **Veterinarian**: vet@example.com / vet123
- **Rescue Group**: rescue@example.com / rescue123

## Troubleshooting

### Mobile App Connection Issues

If the mobile app cannot connect to the backend:
1. Ensure all components are running
2. Check that your mobile device and computer are on the same network
3. Verify the backend IP address in `mobile/services/api.js`
4. Check firewall settings on your computer

### Desktop App Issues

If the desktop app fails to start:
1. Ensure Java JDK 17+ is installed and in your PATH
2. Verify Maven is properly configured
3. Check the console output for specific error messages
4. Ensure the backend server is running before starting the desktop app

### Backend Server Issues

If the backend server fails to start:
1. Check that port 3000 is not already in use
2. Verify all Node.js dependencies are installed
3. Check the `.env` file for correct configuration
4. Ensure the database directory and files exist

## Development

### Backend Development

To run the backend in development mode with auto-reload:

```bash
cd HAVEN
npm run dev
```

To run tests:
```bash
cd HAVEN
npm test
```

### Mobile Development

To run the mobile app with Expo:

```bash
cd mobile
npx expo start
```

To run mobile tests:
```bash
cd mobile
npm test
```

### Desktop Development

To run the desktop app:

```bash
cd desktop
mvn exec:java
```

To run desktop tests:
```bash
cd desktop
mvn test
```

### Project-wide Testing

To run the real-time synchronization tests:

```bash
node tests/test-realtime-sync.js
```

To test emergency reporting workflow:
```bash
node tests/test-emergency-workflow.js
```

## Architecture

The system follows a three-tier architecture:
1. **Presentation Layer**: Mobile and desktop applications
2. **Logic Layer**: Backend API server
3. **Data Layer**: CSV-based persistence

All components communicate through the central backend API, with real-time updates propagated via WebSocket connections.

### Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Mobile**: React Native, Expo, WebSocket
- **Desktop**: Java Swing, JXMapViewer2, Tyrus WebSocket
- **Data**: CSV files
- **Authentication**: JWT
- **Build Tools**: npm, Maven

### Security Considerations

- All API requests use JWT tokens for authentication
- Passwords are hashed using bcrypt
- WebSocket connections require authentication
- CORS policies restrict unauthorized access

## Automatic Environment Configuration

The HAVEN system now includes automatic environment variable configuration to make it easier to deploy across different devices and networks. When you run the [init.bat](file:///c%3A/Users/conde/Downloads/HAVEN/init.bat) or [run.bat](file:///c%3A/Users/conde/Downloads/HAVEN/run.bat) scripts, the system will automatically:

1. Detect the server's IP address on the local network
2. Create or update environment configuration files for all components:
   - Mobile app: Creates/updates `mobile/.env` with `REACT_NATIVE_BACKEND_IP`
   - Desktop app: Creates/updates `desktop/.env` with `HAVEN_BACKEND_URL`
3. Configure the backend server to bind to all network interfaces
4. Generate a QR code for easy mobile app access

### How It Works

1. **IP Detection**: The system automatically detects the server's IP address by checking Wi-Fi and Ethernet interfaces
2. **Environment Files**: Environment variables are automatically written to `.env` files in each component directory
3. **Network Binding**: The backend server binds to `0.0.0.0` to accept connections from any network interface
4. **QR Code Generation**: A QR code is generated for easy mobile app access via Expo Go

### Manual Configuration (if needed)

If you need to manually configure the environment variables, you can create `.env` files in each component directory:

**Mobile App** (`mobile/.env`):
```
REACT_NATIVE_BACKEND_IP=http://YOUR_SERVER_IP:3000
```

**Desktop App** (`desktop/.env`):
```
HAVEN_BACKEND_URL=http://YOUR_SERVER_IP:3000
```

Replace `YOUR_SERVER_IP` with the actual IP address of the computer running the backend server.
