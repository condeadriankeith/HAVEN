const axios = require('axios');
const WebSocket = require('ws');

// Test script to verify alert synchronization between mobile and desktop apps
async function testAlertSync() {
  console.log('Starting alert synchronization test...');
  
  try {
    // 1. Register a new user
    console.log('1. Registering a new test user...');
    const registerResponse = await axios.post('http://localhost:3000/api/v1/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
      pets: []
    });
    
    console.log('   User registered successfully');
    
    // 2. Login with the new user
    console.log('2. Logging in with test user...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   User logged in successfully');
    
    // 3. Connect to WebSocket
    console.log('3. Connecting to WebSocket...');
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.on('open', function open() {
      console.log('   WebSocket connected');
      
      // Authenticate
      ws.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    });
    
    ws.on('message', function incoming(data) {
      const message = JSON.parse(data);
      if (message.type === 'authenticated') {
        console.log('   WebSocket authenticated');
        
        // Subscribe to emergency alerts
        ws.send(JSON.stringify({
          type: 'subscribe-emergency-alerts'
        }));
      } else if (message.type === 'subscription-ack') {
        console.log('   Subscribed to emergency alerts');
        
        // 4. Create an emergency alert
        console.log('4. Creating emergency alert...');
        const emergencyData = {
          latitude: 10.6765,
          longitude: 122.9509,
          emergencyType: 'Test Emergency',
          additionalDetails: 'This is a test emergency alert'
        };
        
        // Send via WebSocket
        ws.send(JSON.stringify({
          type: 'new-emergency-alert',
          emergency: emergencyData
        }));
      } else if (message.type === 'emergency-ack') {
        console.log('   Emergency alert sent successfully via WebSocket');
        console.log('   Test completed successfully!');
        ws.close();
        process.exit(0);
      } else if (message.type === 'error') {
        console.error('   Error:', message.message);
        ws.close();
        process.exit(1);
      }
    });
    
    ws.on('error', function error(err) {
      console.error('   WebSocket error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testAlertSync();