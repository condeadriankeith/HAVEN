const WebSocket = require('ws');

// Test script to simulate a mobile app sending an emergency alert

async function testMobileAlert() {
  console.log('Testing mobile app emergency alert...\n');
  
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', async function open() {
    console.log('Connected to WebSocket server');
    
    // Subscribe to emergency alerts (simulating mobile app behavior)
    ws.send(JSON.stringify({
      type: 'subscribe-emergency-alerts'
    }));
    
    // Simulate sending an emergency alert from mobile app
    console.log('Sending emergency alert from mobile app...');
    
    // This simulates the structure sent by the mobile app
    const mobileEmergencyData = {
      userId: 'USR-0001',
      contactInfo: {
        name: 'Mobile User',
        phone: '+1234567890',
        email: 'mobile@example.com'
      },
      location: {
        latitude: 10.6765 + (Math.random() - 0.5) * 0.01,
        longitude: 122.9509 + (Math.random() - 0.5) * 0.01,
        accuracy: 5,
        altitude: 10,
        heading: 90,
        speed: 0,
        address: 'Bacolod City, Philippines'
      },
      emergencyType: "Pet Health Emergency",
      timestamp: new Date().toISOString(),
      additionalDetails: "Pet needs immediate veterinary attention"
    };
    
    // Send the emergency alert in the format expected by the mobile app
    ws.send(JSON.stringify({
      type: 'new-emergency-alert',
      emergency: mobileEmergencyData
    }));
    
    console.log('Emergency alert sent from mobile app');
    console.log('Emergency data:', JSON.stringify(mobileEmergencyData, null, 2));
    
    // Close WebSocket connection after a short delay
    setTimeout(() => {
      ws.close();
    }, 2000);
  });
  
  ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    console.log('Received WebSocket message:', message.type);
    
    if (message.type === 'subscription-ack') {
      console.log('✓ Mobile app subscribed to emergency alerts');
    } else if (message.type === 'new-emergency-alert') {
      console.log('✓ Emergency alert broadcast received');
      console.log('Emergency ID:', message.emergency.emergencyId);
      console.log('Emergency Type:', message.emergency.emergencyType);
      console.log('Status:', message.emergency.status);
    }
  });
  
  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
  
  ws.on('close', function close() {
    console.log('WebSocket connection closed');
    console.log('\nMobile app emergency alert test completed.');
    console.log('Please check the desktop application to verify the analytics dashboard was updated.');
  });
}

// Run the test
testMobileAlert();