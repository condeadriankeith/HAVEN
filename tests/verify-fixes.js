const WebSocket = require('ws');
const { readCSV, writeCSV } = require('../HAVEN/csvHandler');

// Test script to verify all fixes are working correctly

async function testFixes() {
  console.log('Testing all fixes...\n');
  
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', async function open() {
    console.log('Connected to WebSocket server');
    
    // Subscribe to emergency alerts
    ws.send(JSON.stringify({
      type: 'subscribe-emergency-alerts'
    }));
    
    // Wait for subscription acknowledgment
    setTimeout(() => {
      // Simulate sending an emergency alert with user and pet information
      console.log('Sending test emergency alert with user and pet information...');
      
      const testEmergency = {
        emergencyId: 'EMG-TEST-002',
        userId: 'USR-0001',
        userName: 'Test User',
        userPhone: '+1234567890',
        userEmail: 'test@example.com',
        userPets: JSON.stringify([
          {
            name: 'Buddy',
            breed: 'Golden Retriever',
            age: '3',
            type: 'Dog'
          },
          {
            name: 'Whiskers',
            breed: 'Persian',
            age: '2',
            type: 'Cat'
          }
        ]),
        latitude: 10.6765,
        longitude: 122.9509,
        address: 'Test Location, Bacolod City',
        emergencyType: 'Pet Health Emergency',
        status: 'ACTIVE',
        reportedAt: new Date().toISOString(),
        respondedAt: '',
        resolvedAt: '',
        assignedResponderId: '',
        notes: 'Test emergency for fix verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      ws.send(JSON.stringify({
        type: 'new-emergency-alert',
        emergency: testEmergency
      }));
      
      console.log('Test emergency alert sent.');
      
      // Wait a moment for the alert to be processed
      setTimeout(async () => {
        console.log('Verifying test emergency alert was saved...\n');
        
        // Read emergencies from CSV to verify the alert was saved
        try {
          const emergencies = await readCSV('emergencies.csv');
          const testEmergencyRecord = emergencies.find(e => e.emergencyId === 'EMG-TEST-002');
          
          if (testEmergencyRecord) {
            console.log('✓ Emergency alert successfully saved to database');
            console.log('Emergency ID:', testEmergencyRecord.emergencyId);
            console.log('User Name:', testEmergencyRecord.userName);
            console.log('User Phone:', testEmergencyRecord.userPhone);
            console.log('User Email:', testEmergencyRecord.userEmail);
            console.log('User Pets:', testEmergencyRecord.userPets);
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
    }, 1000);
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
      console.log('User Name:', message.emergency.userName);
      console.log('User Phone:', message.emergency.userPhone);
      console.log('User Email:', message.emergency.userEmail);
      console.log('User Pets:', message.emergency.userPets);
      console.log('Status:', message.emergency.status);
    }
  });
  
  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
  
  ws.on('close', function close() {
    console.log('WebSocket connection closed');
    console.log('\nTest completed. Please check:');
    console.log('1. Desktop app users panel should show real users (not just mock data)');
    console.log('2. Alert cards should show contact information and pet details');
    console.log('3. Clicking alert cards should center the map (not add new markers)');
    console.log('4. Profile page should save and display pet information correctly');
  });
}

// Run the test
testFixes();