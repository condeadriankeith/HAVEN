# HAVEN Pet Emergency Response System

HAVEN is an integrated multi-tier pet emergency response platform connecting pet owners, veterinary clinics, and rescue organizations in real time during critical incidents.

---

## System Overview

The HAVEN platform consists of three integrated layers:

1. **Backend API & Real-time Server (Node.js / Express)**: Central service handling authentication, incident dispatching, shortest-path telemetry, and real-time state synchronization via Socket.IO and WebSockets.
2. **Mobile Client (React Native / Expo)**: Rapid one-tap emergency alerting with automatic GPS telemetry and pet medical profile transmission for pet owners.
3. **Web Responder Console (React 19 / Vite)**: High-throughput incident monitoring command center with interactive Leaflet mapping, street-by-street routing, audio sirens, dispatch simulator, and analytics for veterinarians and rescue units.

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
                                                       | Web Responder Console|
                                                       | (React 19 / Vite)    |
                                                       +----------------------+
```

1. **Incident Dispatch**: Pet owner triggers an alert from the mobile client or web simulator.
2. **Telemetry Capture**: Device captures GPS coordinates and uploads incident payload via REST API or WebSocket.
3. **Real-time Broadcast**: Node.js WebSocket & Socket.IO engine broadcasts incident data to connected web responder consoles.
4. **Status Lifecycle**: Responders acknowledge, dispatch units, navigate via shortest-path routes, and resolve emergencies with real-time status updates broadcast across all connected clients.

---

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO, WebSockets (`ws`), JWT Authentication, bcrypt
- **Mobile Application**: React Native, Expo, Location Services API
- **Web Responder Console**: React 19, Vite, Leaflet, React Leaflet, Lucide Icons, Web Audio API, Axios, Socket.IO Client
- **Persistence**: Structured CSV data store with atomic read/write handlers

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Quick Start

```bash
# Windows
init.bat
run.bat

# Linux / macOS
chmod +x init.sh run.sh
./init.sh
./run.sh
```

The startup scripts initialize dependencies, detect network interface IPs, generate client `.env` configurations, and launch the backend server, mobile development server, and web responder console.

---

## Manual Component Execution

### 1. Backend Server
```bash
cd HAVEN
npm install
npm run start
# Server runs on http://localhost:3000
```

### 2. Web Responder Console
```bash
cd web
npm install
npm run dev
# Web console opens at http://localhost:5173
```

### 3. Mobile Application
```bash
cd mobile
npm install
npx expo start
# Mobile bundler runs on http://localhost:19006
```

---

## Testing & Verification

Run the comprehensive integration test suite:
```bash
node tests/test-react-web-integration.js
```

---

## License

This project is developed for academic and demonstration purposes.