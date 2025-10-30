/**
 * Test script for real-time synchronization between components
 * This script tests the integration between the backend server, mobile app, and desktop app
 */

const WebSocket = require('ws');
const axios = require('axios');
const { readCSV } = require('./HAVEN/csvHandler');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';
const WEBSOCKET_URL = 'ws://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  phone: '555-123-4567',
  password: 'testpassword',
  firstName: 'Test',
  lastName: 'User',
  address: '123 Test St'
};

let authToken = '';
let userId = '';

/**
 * Test user registration
 */
async function testUserRegistration() {
  console.log('Testing user registration...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    console.log('✓ User registration successful');
    authToken = response.data.token;
    userId = response.data.userId;
    return true;
  } catch (error) {
    console.error('✗ User registration failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test user login
 */
async function testUserLogin() {
  console.log('Testing user login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✓ User login successful');
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('✗ User login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test emergency alert creation
 */
async function testEmergencyAlertCreation() {
  console.log('Testing emergency alert creation...');
  
  try {
    const emergencyData = {
      type: 'Test Emergency',
      description: 'This is a test emergency alert',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Test Location'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/emergencies/alert`, emergencyData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ Emergency alert creation successful');
    return response.data.emergencyId;
  } catch (error) {
    console.error('✗ Emergency alert creation failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test WebSocket connection and real-time updates
 */
function testWebSocketConnection(emergencyId) {
  console.log('Testing WebSocket connection...');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(WEBSOCKET_URL);
    let authenticated = false;
    let updateReceived = false;
    
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      console.log('✗ WebSocket test timed out');
      ws.close();
      resolve(false);
    }, 10000);
    
    ws.on('open', () => {
      console.log('✓ WebSocket connection established');
      
      // Authenticate
      ws.send(JSON.stringify({
        type: 'authenticate',
        token: authToken
      }));
    });
    
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      
      if (message.type === 'authenticated') {
        console.log('✓ WebSocket authentication successful');
        authenticated = true;
      } else if (message.type === 'emergency_update') {
        console.log('✓ Emergency update received via WebSocket');
        console.log('  Emergency ID:', message.emergency.id);
        console.log('  Status:', message.emergency.status);
        updateReceived = true;
        
        if (authenticated && updateReceived) {
          clearTimeout(timeout);
          ws.close();
          console.log('✓ WebSocket real-time update test successful');
          resolve(true);
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('✗ WebSocket error:', error.message);
      clearTimeout(timeout);
      resolve(false);
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
}

/**
 * Test data consistency in CSV files
 */
async function testDataConsistency(emergencyId) {
  console.log('Testing data consistency in CSV files...');
  
  try {
    // Check users.csv
    const users = await readCSV('users.csv');
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.error('✗ User not found in CSV file');
      return false;
    }
    console.log('✓ User data consistent in CSV');
    
    // Check emergencies.csv
    const emergencies = await readCSV('emergencies.csv');
    const emergency = emergencies.find(e => e.id === emergencyId);
    if (!emergency) {
      console.error('✗ Emergency not found in CSV file');
      return false;
    }
    console.log('✓ Emergency data consistent in CSV');
    
    return true;
  } catch (error) {
    console.error('✗ Data consistency test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting real-time synchronization tests...\n');
  
  // Test 1: User registration
  const registrationSuccess = await testUserRegistration();
  if (!registrationSuccess) {
    console.log('\nTests failed at registration step');
    return;
  }
  
  // Wait a moment for registration to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Emergency alert creation
  const emergencyId = await testEmergencyAlertCreation();
  if (!emergencyId) {
    console.log('\nTests failed at emergency creation step');
    return;
  }
  
  // Wait a moment for emergency creation to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: WebSocket connection and real-time updates
  const websocketSuccess = await testWebSocketConnection(emergencyId);
  if (!websocketSuccess) {
    console.log('\nTests failed at WebSocket step');
    return;
  }
  
  // Test 4: Data consistency
  const consistencySuccess = await testDataConsistency(emergencyId);
  if (!consistencySuccess) {
    console.log('\nTests failed at data consistency step');
    return;
  }
  
  console.log('\n🎉 All tests passed! Real-time synchronization is working correctly.');
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
  });
}

module.exports = {
  testUserRegistration,
  testUserLogin,
  testEmergencyAlertCreation,
  testWebSocketConnection,
  testDataConsistency,
  runTests
};