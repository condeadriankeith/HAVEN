const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Subscribe to emergency alerts
  ws.send(JSON.stringify({
    type: 'subscribe-emergency-alerts'
  }));
  
  // Send a test emergency alert after a short delay
  setTimeout(() => {
    const testEmergency = {
      type: 'new-emergency-alert',
      emergency: {
        emergencyId: 'EMG-TEST-001',
        userId: 'USR-0001',
        userName: 'Test User',
        userPhone: '123-456-7890',
        userEmail: 'test@example.com',
        latitude: 10.6765,
        longitude: 122.9509,
        address: 'Test Location',
        emergencyType: 'Pet Health Emergency',
        status: 'ACTIVE',
        reportedAt: new Date().toISOString(),
        notes: 'This is a test emergency alert',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Sending test emergency alert:', testEmergency);
    ws.send(JSON.stringify(testEmergency));
  }, 2000);
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});