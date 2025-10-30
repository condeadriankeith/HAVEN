# HAVEN Mobile-Desktop Integration Guide

## Overview

This guide explains how to integrate the HAVEN mobile app with the desktop app for seamless emergency alert communication. The mobile app sends emergency alerts to the desktop app, which displays them on a live map for emergency response units.

## Mobile App Implementation

### Emergency Alert Endpoint

The mobile app sends emergency alerts to the desktop app via a REST API endpoint:

```javascript
const sendEmergencyAlert = async (alertData) => {
  try {
    const response = await fetch('http://localhost:3000/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: alertData.userId,
        location: alertData.location,
        timestamp: alertData.timestamp,
        // Additional data as needed
      }),
    });
    
    if (response.ok) {
      console.log('Emergency alert sent successfully');
      // Navigate to confirmation screen
    } else {
      console.error('Failed to send emergency alert');
      // Handle error
    }
  } catch (error) {
    console.error('Network error:', error);
    // Handle network error
  }
};
```

### Alert Data Structure

The mobile app sends the following data structure:

```json
{
  "userId": "user@example.com",
  "location": {
    "latitude": 40.7484405,
    "longitude": -73.9856644
  },
  "timestamp": "2023-05-15T14:30:00Z",
  "deviceInfo": {
    "platform": "iOS",
    "model": "iPhone 12",
    "osVersion": "16.0"
  }
}
```

## Desktop App Implementation

### API Endpoint

The desktop app should implement a REST API endpoint to receive emergency alerts:

```java
// Example Java implementation for the desktop app
@RestController
@RequestMapping("/api")
public class AlertController {
    
    @PostMapping("/alerts")
    public ResponseEntity<String> receiveAlert(@RequestBody EmergencyAlert alert) {
        try {
            // Process the emergency alert
            alertService.processAlert(alert);
            
            // Update the live map
            mapService.addAlertToMap(alert);
            
            // Notify emergency response units
            notificationService.notifyResponders(alert);
            
            return ResponseEntity.ok("Alert received and processed");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing alert");
        }
    }
}
```

### Emergency Alert Model

```java
public class EmergencyAlert {
    private String userId;
    private Location location;
    private String timestamp;
    private DeviceInfo deviceInfo;
    
    // Constructors, getters, and setters
}

public class Location {
    private double latitude;
    private double longitude;
    
    // Constructors, getters, and setters
}

public class DeviceInfo {
    private String platform;
    private String model;
    private String osVersion;
    
    // Constructors, getters, and setters
}
```

### Live Map Integration

When an emergency alert is received, the desktop app should:

1. Add a marker to the live map at the specified location
2. Display relevant alert information in a popup or sidebar
3. Notify emergency response units
4. Update the alert status in real-time

```java
// Example map integration
public void addAlertToMap(EmergencyAlert alert) {
    // Create a new marker on the map
    Marker marker = new Marker(
        alert.getLocation().getLatitude(),
        alert.getLocation().getLongitude(),
        AlertMarkerType.EMERGENCY
    );
    
    // Add marker to map
    mapView.addMarker(marker);
    
    // Display alert information
    alertPanel.displayAlert(alert);
}
```

## Network Configuration

### Development Environment

For local development, ensure both apps can communicate:

1. Mobile and desktop apps are on the same network
2. Desktop app server is running on port 3000
3. Firewall allows connections on port 3000

### Production Environment

For production deployment:

1. Deploy desktop app server to a publicly accessible IP or domain
2. Configure HTTPS for secure communication
3. Implement authentication and rate limiting
4. Set up proper error handling and logging

## Testing Integration

### Manual Testing

1. Start the desktop app server
2. Start the mobile app
3. Trigger an emergency alert from the mobile app
4. Verify the alert appears on the desktop app's live map
5. Check that emergency response units are notified

### Automated Testing

```javascript
// Example integration test
describe('Mobile-Desktop Integration', () => {
  test('Emergency alert is sent to desktop app', async () => {
    // Mock the desktop app endpoint
    const mockServer = new MockServer(3000);
    
    // Trigger emergency alert from mobile app
    await sendEmergencyAlert(mockAlertData);
    
    // Verify the alert was received
    expect(mockServer.receivedAlerts).toHaveLength(1);
    expect(mockServer.receivedAlerts[0]).toEqual(mockAlertData);
  });
});
```

## Error Handling

### Network Errors

Handle network connectivity issues gracefully:

```javascript
const handleNetworkError = (error) => {
  // Show user-friendly error message
  Alert.alert(
    'Connection Error',
    'Unable to send emergency alert. Please check your internet connection and try again.',
    [{ text: 'Retry', onPress: () => sendEmergencyAlert(alertData) }]
  );
};
```

### Server Errors

Handle server-side errors:

```javascript
const handleServerError = (response) => {
  if (response.status === 503) {
    Alert.alert(
      'Service Unavailable',
      'Emergency services are currently unavailable. Please try again later or call emergency services directly.'
    );
  } else {
    Alert.alert(
      'Error',
      'An error occurred while sending your emergency alert. Please try again.'
    );
  }
};
```

## Security Considerations

1. Implement HTTPS for all communications
2. Add authentication to prevent unauthorized alert submissions
3. Validate all incoming data to prevent injection attacks
4. Implement rate limiting to prevent abuse
5. Encrypt sensitive data in transit

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure desktop app server is running and accessible
2. **CORS Errors**: Configure CORS headers on the desktop app server
3. **Timeout Errors**: Check network connectivity and server response time
4. **Data Format Errors**: Verify data structures match between apps

### Debugging Tips

1. Use network monitoring tools to inspect API requests
2. Check server logs for error messages
3. Verify both apps are using the same API endpoints
4. Test with simple data payloads first

## Conclusion

The HAVEN mobile-desktop integration provides a seamless emergency response system. By following this guide, you can ensure reliable communication between the mobile app and desktop app, enabling emergency response units to quickly respond to alerts from users in need.