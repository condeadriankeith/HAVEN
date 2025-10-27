# HAVEN: Pet Emergency Response System

## Overview
HAVEN is an integrated mobile and desktop emergency response system designed specifically for pet-related emergencies. The system connects pet owners to local emergency response units, veterinarians, and animal rescue organizations in real time.

## Project Structure
```
HAVEN/
├── HAVEN/              # Backend API Server (Node.js/Express)
├── mobile/             # Mobile Application (React Native/Expo)
├── desktop/            # Desktop Application (Java Swing)
└── docs/               # Documentation
```

## System Components

### 1. Backend API Server
- **Technology**: Node.js with Express.js
- **Port**: 3000
- **Features**:
  - User authentication (JWT)
  - Emergency alert creation
  - Real-time emergency monitoring
  - User management

### 2. Mobile Application
- **Technology**: React Native with Expo
- **Features**:
  - One-tap emergency button
  - User registration and login
  - Emergency alert submission
  - Location-based services

### 3. Desktop Application ✅ **COMPLETED**
- **Technology**: Java Swing with JavaFX WebView
- **Status**: ✅ Fully implemented and tested
- **Features**:
  - Emergency dashboard
  - Real-time emergency monitoring
  - Response coordination
  - Incident logging
  - Interactive map with Leaflet and OpenStreetMap
  - Custom UI components with modern light theme
  - **Enhanced UI/UX with icon-based navigation and animated red map markers**

## Setup and Installation

### Prerequisites
- Node.js 18.x or later
- Java 17 or later
- Expo CLI (for mobile development)
- Maven 3.6 or later (for desktop application)

### Backend API Server Setup
```bash
cd HAVEN
npm install
npm start
```

The server will start on http://localhost:3000

### Mobile Application Setup
```bash
cd mobile
npm install
npx expo start
```

To run on Android:
```bash
npx expo start --android
```

To run on iOS:
```bash
npx expo start --ios
```

### Desktop Application Setup ✅ **READY**
```bash
cd desktop
mvn clean install
mvn exec:java
```

Or use the provided scripts:
- Windows: `run.bat`
- Unix/Linux/Mac: `run.sh`

## Building the Applications

### Backend API Server
The backend is a Node.js application that runs directly with Node.

### Mobile Application
To build the mobile app for distribution:
```bash
cd mobile
npx expo build
```

### Desktop Application ✅ **COMPLETED**
To build the desktop app as a JAR file:
```bash
# Unix/Linux/Mac
cd desktop
./build.sh

# Windows
cd desktop
build.bat
```

The JAR file will be created in `desktop/target/haven-desktop-1.0.0.jar`

## Default Admin Account
- **Username**: admin@example.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Emergencies
- `POST /api/v1/emergencies/alert` - Create emergency alert
- `GET /api/v1/emergencies/active` - Get active emergencies

### User Management
- `GET /api/v1/users/profile` - Get user profile

## Development

### Backend Development
```bash
cd HAVEN
npm run dev
```

### Mobile Development
```bash
cd mobile
npx expo start
```

### Desktop Development ✅ **READY**
```bash
cd desktop
mvn compile
mvn javafx:run
```

## Testing

### Backend Testing
```bash
cd HAVEN
npm test
```

### Mobile Testing
```bash
cd mobile
npm test
```

### Desktop Testing ✅ **IMPLEMENTED**
```bash
cd desktop
mvn test
```

## Documentation
All project documentation can be found in the `docs/` folder:
- Product Requirements Document
- Technical Specification Document
- Development Task Breakdown
- Prototype Implementation Checklist
- Cross-Platform Testing Strategy
- Documentation Requirements
- Project Structure Guide
- System Summary

## License
This project is proprietary to HAVEN Pet Emergency Response System.