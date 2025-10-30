# HAVEN Project Structure

## Overview
This document explains the structure of the HAVEN Pet Emergency Response System, which consists of three main components:
1. Backend API Server
2. Mobile Application (React Native/Expo)
3. Desktop Application (Java Swing)

## Directory Structure
```
HAVEN/
├── HAVEN/              # Backend API Server
│   ├── package.json    # Node.js dependencies
│   ├── server.js       # Main server file
│   ├── .env            # Environment variables
│   └── test-api.js     # API testing script
│
├── mobile/             # Mobile Application
│   ├── package.json    # React Native dependencies
│   ├── App.js          # Main mobile app component
│   └── app.json        # Expo configuration
│
├── desktop/            # Desktop Application
│   ├── pom.xml         # Maven configuration
│   └── src/            # Java source code
│       └── main/
│           └── java/
│               └── com/
│                   └── haven/
│                       └── desktop/
│                           ├── Main.java           # Entry point
│                           └── HAVENDesktopApp.java # Main window
│
├── docs/               # Documentation
│   ├── PROJECT_STRUCTURE.md
│   └── [Other documentation files]
│
├── README.md           # Main project documentation
├── init.sh             # Unix initialization script
├── init.bat            # Windows initialization script
├── run.sh              # Unix run script
└── run.bat             # Windows run script
```

## Component Details

### Backend API Server (Node.js/Express)
The backend provides RESTful APIs for the mobile and desktop applications.

**Key Files:**
- `server.js`: Main server implementation with Express.js
- `package.json`: Dependencies and scripts
- `.env`: Environment variables
- `test-api.js`: Simple API testing script

**API Endpoints:**
- Authentication: `/api/v1/auth/login`, `/api/v1/auth/register`
- User Management: `/api/v1/users/profile`
- Emergency Management: `/api/v1/emergencies/alert`, `/api/v1/emergencies/active`

### Mobile Application (React Native/Expo)
The mobile app provides a user-friendly interface for pet owners to send emergency alerts.

**Key Files:**
- `App.js`: Main React Native component
- `package.json`: Dependencies and scripts

**Features:**
- User authentication
- Emergency alert button
- Location services
- Real-time communication with backend

### Desktop Application (Java Swing)
The desktop app provides an emergency response dashboard for emergency responders.

**Key Files:**
- `pom.xml`: Maven configuration
- `Main.java`: Entry point
- `HAVENDesktopApp.java`: Main application window

**Features:**
- Emergency dashboard
- Real-time monitoring
- Response coordination
- Incident logging

## Development Workflow

### 1. Initialize the Project
```bash
# Unix/Linux/Mac
./init.sh

# Windows
init.bat
```

### 2. Start Development Servers
```bash
# Start backend
cd HAVEN && npm start

# Start mobile app
cd mobile && npx expo start

# Start desktop app
cd desktop && mvn exec:java
```

### 3. Run All Components
```bash
# Unix/Linux/Mac
./run.sh

# Windows
run.bat
```

## Testing

### Backend Testing
```bash
cd HAVEN
npm test
```

### Manual Testing
1. Start the backend server
2. Login with default admin credentials:
   - Email: admin@example.com
   - Password: admin123
3. Test emergency alert functionality
4. Verify desktop dashboard receives alerts

## Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting platform (Heroku, AWS, etc.).

### Mobile Deployment
The mobile app can be built and deployed to app stores using Expo.

### Desktop Deployment
The desktop app can be packaged as a JAR file for distribution.

## Future Enhancements
1. Integration with Firebase for real-time database
2. Google Maps integration for location services
3. Push notifications for emergency alerts
4. Advanced analytics dashboard
5. Multi-language support
6. Enhanced security features