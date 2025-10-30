# HAVEN Real-Time Synchronization Architecture

## Overview

This document describes the architecture and implementation of the real-time bidirectional communication system for the HAVEN pet emergency response system. The system enables seamless data synchronization between the mobile app, desktop app, and CSV-based database through a centralized backend server.

## System Architecture

### Components

1. **Mobile Application** (React Native/Expo)
2. **Desktop Application** (Java Swing)
3. **Backend Server** (Node.js/Express)
4. **Database Layer** (CSV files)

### Communication Flow

```
Mobile App ←→ WebSocket ←→ Backend Server ←→ CSV Files
Desktop App ←→ WebSocket ←→ Backend Server ←→ CSV Files
```

## Implementation Details

### 1. Database Structure

The system uses CSV files for data persistence, organized in the `database/` directory:

- `users.csv` - User account information
- `emergencies.csv` - Emergency alert records
- `responders.csv` - Emergency responder information

### 2. Backend Server

The backend server is built with Node.js and Express, with the following key features:

#### CSV Handler (`csvHandler.js`)
- Provides async functions for reading, writing, and appending to CSV files
- Implements file locking mechanism to prevent concurrent access issues
- Handles CSV parsing with proper quote and comma escaping

#### WebSocket Server (`websocketServer.js`)
- Implements real-time communication using the `ws` library
- Manages client connections and authentication
- Broadcasts emergency updates to all connected clients

#### REST API Endpoints
- `/api/v1/auth/register` - User registration
- `/api/v1/auth/login` - User authentication
- `/api/v1/users/profile` - User profile retrieval
- `/api/v1/emergencies/alert` - Emergency alert creation
- `/api/v1/emergencies/active` - Active emergencies retrieval
- `/api/v1/emergencies/:id` - Emergency status updates

### 3. Mobile Application

The mobile application uses React Native with Expo and implements:

#### WebSocket Service (`services/websocket.js`)
- WebSocket client using the `websocket` library
- Automatic reconnection handling
- Event-based message handling
- Authentication flow integration

#### API Integration
- Modified existing API service to connect WebSocket after login
- Added listeners for real-time emergency updates

### 4. Desktop Application

The desktop application uses Java Swing and implements:

#### WebSocket Client (`WebSocketClient.java`)
- WebSocket client using Tyrus library
- Session management and authentication
- Message handling for emergency updates

#### API Service Integration
- Modified existing API service to connect WebSocket after login
- Added emergency update listener interface

## Data Consistency and Concurrency Control

### File Locking Mechanism

To prevent data corruption from concurrent access, the CSV handler implements a simple file locking mechanism:

1. Before accessing a file, acquire a lock for that file
2. Perform read/write operations
3. Release the lock after operations complete
4. Other requests wait for the lock to be released

### Data Validation

All data operations include validation to ensure data integrity:
- Input sanitization for CSV fields
- Proper escaping of special characters
- Type checking for numeric values

## Real-Time Synchronization

### Push Mechanism

1. When an emergency is created or updated, the backend broadcasts the change via WebSocket
2. All connected clients receive the update in real-time
3. Clients update their local state immediately

### Pull Mechanism

1. Clients can still use REST API endpoints to fetch data
2. Provides fallback when WebSocket connection is unavailable
3. Used for initial data loading

## Security Considerations

### Authentication

- JWT tokens are used for authentication
- WebSocket connections require authentication before sending/receiving messages
- Tokens are verified before any operation

### Data Protection

- Passwords are hashed using bcrypt
- Sensitive data is not transmitted over WebSocket without encryption
- HTTPS should be used in production environments

## Testing Strategy

### Unit Testing

- CSV handler functions
- WebSocket message handling
- API endpoint responses

### Integration Testing

- End-to-end data flow from mobile/desktop to database
- Real-time update propagation
- Concurrent access scenarios

### Performance Testing

- Connection handling under load
- File I/O performance with concurrent access
- Memory usage with many connected clients

## Deployment Considerations

### Scalability

- For production, consider using a proper database instead of CSV files
- Load balancing for multiple backend instances
- Redis or similar for WebSocket session storage

### Monitoring

- Log all WebSocket connections and disconnections
- Monitor file I/O operations
- Track API response times

## Future Enhancements

1. **Database Migration** - Move from CSV to a proper database system
2. **Message Queuing** - Implement message queues for better scalability
3. **Advanced Caching** - Add caching layer for frequently accessed data
4. **Enhanced Security** - Implement end-to-end encryption for sensitive data
5. **Offline Support** - Add offline capabilities with sync when reconnected

## Conclusion

This real-time synchronization system provides a robust foundation for the HAVEN pet emergency response system. By combining REST APIs with WebSocket communication and CSV-based storage, it enables seamless data flow between all components while maintaining data consistency and providing real-time updates.