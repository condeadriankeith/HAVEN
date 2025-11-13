const WebSocket = require('ws');
const { readCSV, writeCSV } = require('../HAVEN/csvHandler');
const bcrypt = require('bcryptjs');

// Test script to verify CSV clearing and expandable alert cards functionality

async function testFixes() {
  console.log('Testing CSV clearing and expandable alert cards...\n');
  
  try {
    // Test 1: Verify CSV clearing preserves only admin user
    console.log('Test 1: Verifying CSV clearing...');
    
    // Read current users
    const users = await readCSV('users.csv');
    console.log('Current users in database:', users.length);
    
    // Check if only admin user exists
    const adminUser = users.find(user => user.email === 'admin@example.com');
    const otherUsers = users.filter(user => user.email !== 'admin@example.com');
    
    if (adminUser && otherUsers.length === 0) {
      console.log('✓ CSV clearing working correctly - only admin user preserved');
    } else if (!adminUser) {
      console.log('✗ Admin user missing from database');
    } else {
      console.log('✗ Other users found in database:', otherUsers.length);
    }
    
    // Test 2: Add a test user to verify clearing works
    console.log('\nTest 2: Adding test user...');
    
    const testUser = {
      id: 'USR-TEST-001',
      email: 'testuser@example.com',
      phone: '+1234567890',
      firstName: 'Test',
      lastName: 'User',
      address: 'Test Address',
      role: 'pet_owner',
      password: bcrypt.hashSync('test123', 10) // Hash the password
    };
    
    // Add test user to CSV
    const updatedUsers = [...users, testUser];
    const userHeaders = ['id', 'email', 'phone', 'firstName', 'lastName', 'address', 'role', 'password'];
    await writeCSV('users.csv', updatedUsers, userHeaders);
    
    console.log('✓ Test user added');
    
    // Re-read users to verify
    const usersAfterAdd = await readCSV('users.csv');
    console.log('Users after adding test user:', usersAfterAdd.length);
    
    // Test 3: Connect to WebSocket and test alert cards
    console.log('\nTest 3: Testing alert cards with expandable functionality...');
    
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
        // Simulate sending an emergency alert with detailed information
        console.log('Sending test emergency alert with detailed information...');
        
        const testEmergency = {
          emergencyId: 'EMG-TEST-EXPAND-001',
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
          notes: 'This is a detailed description of the emergency that should be expandable in the alert card. The user reported that their pet is showing signs of distress and needs immediate veterinary attention. The pet has been lethargic and not eating for the past 24 hours.',
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
            const testEmergencyRecord = emergencies.find(e => e.emergencyId === 'EMG-TEST-EXPAND-001');
            
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
      console.log('1. Desktop app should only show admin user (test user should be cleared on restart)');
      console.log('2. Alert cards should be expandable/collapsible with ▲/▼ buttons');
      console.log('3. Expanded cards should show additional details like ID and coordinates');
      console.log('4. Long descriptions should be truncated when collapsed and fully shown when expanded');
    });
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testFixes();