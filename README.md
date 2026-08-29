# HAVEN Pet Emergency Response System

HAVEN is an integrated multi-tier pet emergency response platform connecting pet owners, veterinary clinics, and rescue organizations in real time during critical incidents.

---

## System Overview

The HAVEN platform consists of three integrated layers:

1. **Backend API Server (Node.js / Express)**: Central service handling authentication, incident dispatching, and real-time state synchronization.
2. **Mobile Client (React Native / Expo)**: Rapid one-tap emergency alerting with automatic GPS telemetry for pet owners.
3. **Desktop Responder Console (Java Swing)**: High-throughput incident monitoring dashboard with interactive mapping for veterinarians and rescue units.

---

## Architecture and Workflow

```
+------------------+         REST / WebSockets         +----------------------+
|   Mobile Client  | <===============================> |  Backend API Server  |
|  (Pet Owners)    |                                   |  (Node.js / Express) |
+------------------+                                   +----------------------+
                                                                  ^
                                                                  |  WebSockets / REST
                                                                  v
                                                       +----------------------+
                                                       | Desktop Console      |
                                                       | (Responders / Vets)  |
                                                       +----------------------+
```

1. **Incident Dispatch**: Pet owner triggers an alert from the mobile client.
2. **Telemetry Capture**: Device captures GPS coordinates and uploads incident payload via REST API.
3. **Real-time Broadcast**: Node.js WebSocket engine broadcasts incident data to connected desktop responder clients.
4. **Status Lifecycle**: Responders acknowledge, assign units, and resolve emergencies with real-time status updates broadcast across all connected clients.

---

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO / WebSocket, JWT Authentication, bcrypt
- **Mobile Application**: React Native, Expo, Location Services API
- **Desktop Application**: Java 17, Java Swing, JXMapViewer2, Tyrus WebSocket Client, Maven
- **Persistence**: Structured CSV data store with atomic read/write handlers

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Java JDK 17 or higher
- Apache Maven 3.9.x
- Expo CLI (`npm install -g expo-cli`)

### Quick Start

```bash
# Windows
init.bat
run.bat

# Linux / macOS
./init.sh
./run.sh
```

The startup scripts initialize dependencies, detect network interface IPs, generate client `.env` configurations, and launch the backend server, mobile development server, and desktop client.

---

## Manual Component Execution

### Backend Server
```bash
cd HAVEN
npm install
npm run dev
```

### Mobile Application
```bash
cd mobile
npm install
npx expo start
```

### Desktop Console
```bash
cd desktop
mvn clean compile exec:java
```

---

## License

This project is developed for academic and demonstration purposes.