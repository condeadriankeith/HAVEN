const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:3000';

async function runIntegrationTest() {
  console.log('=== STARTING REACT WEB CONSOLE INTEGRATION TEST ===\n');

  try {
    // 1. Test Admin Login
    console.log('1. Testing Admin Login...');
    const loginRes = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (!loginRes.data || !loginRes.data.token) {
      throw new Error('Admin login failed: No token received');
    }
    const token = loginRes.data.token;
    console.log('✓ Admin login successful. Token received.\n');

    // 2. Fetch Users Directory
    console.log('2. Testing Get Users Endpoint...');
    const usersRes = await axios.get(`${API_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ Fetched ${usersRes.data.users.length} user(s) from HAVEN backend.\n`);

    // 3. Socket.IO Connection & Emergency Broadcast
    console.log('3. Testing Socket.IO Real-time Connection...');
    const socket = io(API_URL, {
      reconnection: false,
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);

      socket.on('connect', () => {
        console.log('✓ Socket.IO client connected with ID:', socket.id);
        socket.emit('subscribe-emergency-alerts', {});
        clearTimeout(timeout);
        resolve();
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Listen for real-time alert event
    socket.on('new-emergency-alert', (data) => {
      console.log('⚡ Received real-time alert via Socket.IO:', data.emergency?.emergencyId || data.emergencyId);
    });

    // 4. Send Emergency Alert
    console.log('\n4. Sending Emergency Alert via REST API...');
    const alertData = {
      location: {
        latitude: 10.6812,
        longitude: 122.9550,
        address: 'Bacolod City Plaza'
      },
      emergencyType: 'Pet Respiratory Distress',
      additionalDetails: 'Dog struggling to breathe near park'
    };

    const alertRes = await axios.post(`${API_URL}/api/v1/emergencies/alert`, alertData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const createdEmergency = alertRes.data.emergency;
    console.log(`✓ Emergency alert created! ID: ${createdEmergency.emergencyId}\n`);

    // Wait 1 second for socket broadcast
    await new Promise(r => setTimeout(r, 1000));

    // 5. Test Route Calculation
    console.log('5. Testing Shortest Path Route Calculation...');
    const routeRes = await axios.post(`${API_URL}/api/v1/routes/shortest-path`, {
      startLat: 10.6765,
      startLng: 122.9509,
      endLat: createdEmergency.latitude,
      endLng: createdEmergency.longitude
    });

    console.log(`✓ Route calculated successfully. Route polyline received.\n`);

    // 6. Test Status Update
    console.log('6. Updating Emergency Status to RESPONDED...');
    const updateRes = await axios.put(`${API_URL}/api/v1/emergencies/${createdEmergency.emergencyId}`, {
      status: 'RESPONDED'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✓ Emergency status updated: ${updateRes.data.emergency.status}\n`);

    socket.disconnect();
    console.log('=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
    process.exit(0);

  } catch (err) {
    console.error('❌ Integration Test Failed:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
}

runIntegrationTest();
