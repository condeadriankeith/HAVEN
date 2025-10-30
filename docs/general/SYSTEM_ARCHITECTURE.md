# HAVEN System Architecture

## Overview
This document provides a visual representation of the HAVEN Pet Emergency Response System architecture.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        HAVEN System Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mobile App Layer          API Gateway         Desktop App Layer│
│  ┌─────────────────┐       ┌────────────┐     ┌────────────────┐│
│  │   React Native  │◄──────┤ REST API   ├────►│   Java Swing   ││
│  │   (Expo Go)     │       │ Server     │     │   Desktop App  ││
│  └────────┬────────┘       └─────┬──────┘     └────────┬───────┘│
│           │                      │                      │      │
│           ▼                      ▼                      ▼      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    Backend Server (Node.js)                 ││
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │Authentication│  │   Database   │  │  Emergency Mgmt  │  ││
│  │  │(JWT/Bcrypt) │  │(In-Memory)   │  │  (Alerts/Logs)   │  ││
│  │  └─────────────┘  └──────────────┘  └──────────────────┘  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│  External Services:                                             │
│  - Expo Go (Mobile Testing)                                    │
│  - Maven (Desktop Build)                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### 1. Mobile Application Flow
```
Mobile App → REST API → Backend Processing → Database
Mobile App ← REST API ← Backend Processing ← Database
```

### 2. Desktop Application Flow
```
Desktop App → REST API → Backend Processing → Database
Desktop App ← REST API ← Backend Processing ← Database
```

### 3. Authentication Flow
```
1. User submits login credentials (Mobile/Desktop)
2. Credentials sent to /api/v1/auth/login endpoint
3. Backend validates credentials using bcrypt
4. JWT token generated and returned
5. Client stores token for subsequent requests
```

### 4. Emergency Alert Flow
```
1. User triggers emergency alert (Mobile)
2. Alert sent to /api/v1/emergencies/alert endpoint
3. Backend validates token and processes alert
4. Alert stored in database
5. Notification sent to desktop dashboard
```

## Data Flow

### User Management
```
Registration: Client → POST /api/v1/auth/register → Database
Login: Client → POST /api/v1/auth/login → JWT Token → Client
Profile: Client → GET /api/v1/users/profile → User Data → Client
```

### Emergency Management
```
Create Alert: Client → POST /api/v1/emergencies/alert → Database
View Alerts: Client → GET /api/v1/emergencies/active → Alert List → Client
```

## Security Architecture

### Authentication
- JWT tokens for session management
- bcrypt for password hashing
- Token expiration (24 hours)
- HTTPS-ready (can be enabled with SSL certificate)

### Authorization
- Role-based access control (admin, pet_owner, responder)
- Token-based authentication for all protected endpoints
- CORS configuration for secure cross-origin requests

## Scalability Considerations

### Current Implementation
- In-memory database (for prototype)
- Single server instance
- Basic load handling

### Production Considerations
- Replace in-memory database with Firebase/MongoDB
- Implement load balancing
- Add caching layer (Redis)
- Database connection pooling
- Microservices architecture

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | Node.js/Express | 18.x |
| Mobile | React Native/Expo | SDK 49+ |
| Desktop | Java Swing | Java 17 |
| Database | In-Memory (Prototype) | N/A |
| Authentication | JWT/Bcrypt | Latest |
| Build Tools | npm, Maven | Latest |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Targets                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │   Mobile    │    │   Backend   │    │   Desktop      │  │
│  │  Expo Go    │    │  Node.js    │    │   JAR File     │  │
│  │ Application │    │  Server     │    │  Application   │  │
│  └─────────────┘    └─────────────┘    └────────────────┘  │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │   App       │    │   Cloud     │    │   Desktop      │  │
│  │  Store      │    │   Hosting   │    │   Installer    │  │
│  │ (Google/    │    │ (Heroku/    │    │  (Windows/     │  │
│  │  Apple)     │    │  AWS/etc.)  │    │   Mac/Linux)   │  │
│  └─────────────┘    └─────────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```