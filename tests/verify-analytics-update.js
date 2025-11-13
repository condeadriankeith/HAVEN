const WebSocket = require('ws');
const { readCSV } = require('../HAVEN/csvHandler');

// Test script to verify analytics dashboard updates when emergency alerts are triggered

async function testAnalyticsUpdate() {
  console.log('Testing analytics dashboard updates...\n');
  
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', async function open() {
    console.log('Connected to WebSocket server');
    
    // Subscribe to emergency alerts
    ws.send(JSON.stringify({
      type: 'subscribe-emergency-alerts'
    }));
    
    // Simulate sending an emergency alert
    console.log('Sending test emergency alert...');
    
    const testEmergency = {
      emergencyId: 'EMG-TEST-001',
      userId: 'USR-0001',
      userName: 'Test User',
      userPhone: '+1234567890',
      userEmail: 'test@example.com',
      latitude: 10.6765,
      longitude: 122.9509,
      address: 'Test Location, Bacolod City',
      emergencyType: 'Pet Health Emergency',
      status: 'ACTIVE',
      reportedAt: new Date().toISOString(),
      respondedAt: '',
      resolvedAt: '',
      assignedResponderId: '',
      notes: 'Test emergency for analytics verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ws.send(JSON.stringify({
      type: 'new-emergency-alert',
      emergency: testEmergency
    }));
    
    // Wait a moment for the alert to be processed
    setTimeout(async () => {
      console.log('Test emergency alert sent. Verifying analytics update...\n');
      
      // Read emergencies from CSV to verify the alert was saved
      try {
        const emergencies = await readCSV('emergencies.csv');
        const testEmergencyRecord = emergencies.find(e => e.emergencyId === 'EMG-TEST-001');
        
        if (testEmergencyRecord) {
          console.log('✓ Emergency alert successfully saved to database');
          console.log('Emergency ID:', testEmergencyRecord.emergencyId);
          console.log('Status:', testEmergencyRecord.status);
          console.log('Reported at:', testEmergencyRecord.reportedAt);
        } else {
          console.log('✗ Emergency alert not found in database');
        }
      } catch (error) {
        console.error('Error reading emergencies from CSV:', error);
      }
      
      // Close WebSocket connection
      ws.close();
    }, 2000);
  });
  
  ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    console.log('Received WebSocket message:', message.type);
    
    if (message.type === 'subscription-ack') {
      console.log('✓ Subscribed to emergency alerts');
    } else if (message.type === 'new-emergency-alert') {
      console.log('✓ Received emergency alert notification');
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
    console.log('\nTest completed. Please check the desktop analytics dashboard to verify it was updated.');
  });
}

// Run the test
testAnalyticsUpdate();