# Analytics Dashboard Updates

This document explains how the analytics dashboard in the HAVEN desktop application automatically updates when emergency alerts are triggered from the mobile application.

## How It Works

1. **Emergency Alert Triggered**: When a user presses the emergency button in the mobile app, an alert is sent to the backend server.

2. **Server Processing**: The backend server processes the emergency alert and broadcasts it to all connected WebSocket clients, including the desktop application.

3. **Desktop Application Receives Alert**: The desktop application's WebSocket client receives the emergency alert and notifies the dashboard.

4. **Analytics Update**: The dashboard updates its statistics in real-time:
   - Total Reports count is incremented
   - Active Reports count is incremented
   - Average Response Time is calculated based on resolved emergencies

5. **Visual Feedback**: The dashboard UI is updated to reflect the new statistics.

## Data Tracking

The analytics dashboard tracks the following metrics:

- **Total Reports**: The total number of emergency alerts received
- **Active Reports**: The number of currently active (unresolved) emergencies
- **Avg. Response**: The average time it takes to respond to emergencies (calculated from resolved emergencies)

## Testing

To test the analytics dashboard updates:

1. Start the backend server
2. Start the desktop application
3. Trigger an emergency alert from the mobile application
4. Observe the analytics dashboard in the desktop application update in real-time

You can also run the automated test:
```bash
npm run test:analytics
```

This will simulate an emergency alert and verify that the analytics data is updated correctly.