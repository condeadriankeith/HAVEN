# Alert Synchronization Fixes

This document describes the fixes implemented to resolve the issues with alert synchronization between the mobile app and desktop app.

## Issues Fixed

### 1. No Alert Pin on Desktop Map When Sending from Mobile App

**Problem**: When sending an emergency alert from the mobile app, no alert pin appeared on the desktop map.

**Root Cause**: 
- Inconsistent data structure between mobile app WebSocket communication and desktop app WebSocket handling
- The mobile app was sending emergency data in a nested structure, but the desktop app wasn't properly parsing it
- Missing proper emergency ID propagation from mobile to desktop

**Fixes Applied**:
1. Updated mobile app's [websocket.js](file:///c:/Users/conde/Downloads/HAVEN/mobile/services/websocket.js) to ensure consistent emergency data structure
2. Enhanced desktop app's [WebSocketClient.java](file:///c:/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/WebSocketClient.java) to properly parse nested emergency data
3. Improved [HavenDashboard.java](file:///c:/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/HavenDashboard.java) emergency update handling to extract location data from various possible structures
4. Updated backend [server.js](file:///c:/Users/conde/Downloads/HAVEN/HAVEN/server.js) and [websocketServer.js](file:///c:/Users/conde/Downloads/HAVEN/HAVEN/websocketServer.js) to broadcast alerts through both communication mechanisms
5. Enhanced [MapPanel.java](file:///c:/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/MapPanel.java) to properly handle emergency IDs

### 2. Registration Says Account Already Exists on First Run

**Problem**: When trying to register a new account for the first time, the system reported that the account already exists.

**Root Cause**: 
- The default admin user was being created on server startup
- The registration endpoint was checking for existing users but not excluding the default admin
- This caused conflicts when trying to register with the same email or phone as the default admin

**Fix Applied**:
- Modified the registration endpoint in [server.js](file:///c:/Users/conde/Downloads/HAVEN/HAVEN/server.js) to exclude the default admin user when checking for existing accounts
- This allows re-registration with the admin email for testing purposes

## Technical Details

### Data Structure Consistency

The mobile app now sends emergency data in a consistent nested structure:
```json
{
  "type": "new-emergency-alert",
  "emergency": {
    "latitude": 10.6765,
    "longitude": 122.9509,
    "location": {
      "latitude": 10.6765,
      "longitude": 122.9509,
      "accuracy": 0,
      "altitude": 0,
      "heading": 0,
      "speed": 0,
      "address": ""
    },
    // ... other emergency properties
  }
}
```

The desktop app now properly handles this structure and can also handle flat structures for backward compatibility.

### Emergency ID Propagation

Emergency IDs are now properly propagated from the mobile app through the backend to the desktop app, ensuring that each alert can be uniquely identified across all platforms.

### Dual Broadcast Mechanism

The backend now broadcasts emergency alerts through both:
1. Socket.IO (for web-based clients)
2. WebSocket server (for desktop app)

This ensures all clients receive emergency updates regardless of their connection method.

## Testing

A test script [verify-alert-sync.js](file:///c:/Users/conde/Downloads/HAVEN/tests/verify-alert-sync.js) has been created to verify that:
1. User registration works correctly
2. Emergency alerts sent from a WebSocket client appear in the system
3. Alerts are properly broadcast to all connected clients

To run the test:
```bash
cd HAVEN
node tests/verify-alert-sync.js
```

## Verification Steps

After applying these fixes, you should verify:

1. Start the backend server
2. Start the desktop app
3. Start the mobile app
4. Register a new account in the mobile app (should work without "account already exists" error)
5. Login to the mobile app
6. Send an emergency alert from the mobile app
7. Verify that an alert pin appears on the desktop map
8. Verify that the alert appears in the desktop alert panel

If all steps work correctly, the synchronization issues have been resolved.