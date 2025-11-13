const WebSocket = require('ws');
const { readCSV, writeCSV } = require('../HAVEN/csvHandler');

// Test script to verify pet information display in alert cards
async function testPetInfoDisplay() {
  console.log('Testing pet information display in alert cards...\n');
  
  try {
    // Create a test user with pet information
    console.log('Creating test user with pet information...');
    
    const testUser = {
      id: 'test-user-001',
      email: 'test@example.com',
      phone: '123-456-7890',
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test Street',
      role: 'user',
      password: 'hashed_password_here',
      pets: JSON.stringify([
        {
          name: 'Fluffy',
          type: 'Cat',
          breed: 'Persian'
        },
        {
          name: 'Buddy',
          type: 'Dog',
          breed: 'Golden Retriever'
        }
      ])
    };
    
    // Write test user to CSV
    const userHeaders = ['id', 'email', 'phone', 'firstName', 'lastName', 'address', 'role', 'password', 'pets'];
    await writeCSV('users.csv', [testUser], userHeaders);
    
    console.log('✓ Test user created with pet information');
    
    // Create a test emergency with pet information
    console.log('Creating test emergency with pet information...');
    
    const testEmergency = {
      emergencyId: 'EMERGENCY-001',
      userId: 'test-user-001',
      userName: 'Test User',
      userPhone: '123-456-7890',
      userEmail: 'test@example.com',
      userPets: JSON.stringify([
        {
          name: 'Fluffy',
          type: 'Cat',
          breed: 'Persian'
        },
        {
          name: 'Buddy',
          type: 'Dog',
          breed: 'Golden Retriever'
        }
      ]),
      latitude: 10.6951,
      longitude: 122.9527,
      address: 'Test Location',
      emergencyType: 'Pet Emergency',
      status: 'ACTIVE',
      reportedAt: new Date().toISOString(),
      respondedAt: '',
      resolvedAt: '',
      assignedResponderId: '',
      notes: 'Test emergency for pet information display',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Write test emergency to CSV
    const emergencyHeaders = ['emergencyId', 'userId', 'userName', 'userPhone', 'userEmail', 'userPets', 'latitude', 'longitude', 'address', 'emergencyType', 'status', 'reportedAt', 'respondedAt', 'resolvedAt', 'assignedResponderId', 'notes', 'createdAt', 'updatedAt'];
    await writeCSV('emergencies.csv', [testEmergency], emergencyHeaders);
    
    console.log('✓ Test emergency created with pet information');
    
    // Simulate WebSocket connection to desktop app
    console.log('Simulating WebSocket connection to desktop app...');
    
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.on('open', function open() {
      console.log('✓ Connected to WebSocket server');
      
      // Send emergency update with pet information
      const emergencyUpdate = {
        type: 'new-emergency-alert',
        emergency: testEmergency
      };
      
      ws.send(JSON.stringify(emergencyUpdate));
      console.log('✓ Sent emergency update with pet information to desktop app');
      
      // Close connection after a short delay
      setTimeout(() => {
        ws.close();
        console.log('✓ WebSocket connection closed');
      }, 1000);
    });
    
    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
    });
    
    // Wait for WebSocket operations to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n✓ Pet information display test completed');
    console.log('Please check the desktop app to verify that pet information is displayed in the alert cards:');
    console.log('- Pet names: Fluffy, Buddy');
    console.log('- Pet types: Cat, Dog');
    console.log('- Pet breeds: Persian, Golden Retriever');
    
  } catch (error) {
    console.error('Error during pet information display test:', error);
    process.exit(1);
  }
}

// Run the test
testPetInfoDisplay();