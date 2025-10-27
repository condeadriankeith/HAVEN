const axios = require('axios');

// Test the backend API
async function testAPI() {
  try {
    console.log('Testing HAVEN API...');
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:3000');
    console.log('Root endpoint:', rootResponse.data);
    
    // Test login
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Login successful:', loginResponse.data);
    
    // Test getting profile with valid token
    const profileResponse = await axios.get('http://localhost:3000/api/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Profile:', profileResponse.data);
    
    // Test creating an emergency alert
    const emergencyResponse = await axios.post('http://localhost:3000/api/v1/emergencies/alert', {
      type: 'injury',
      severity: 'critical',
      description: 'Dog hit by car, bleeding heavily',
      location: {
        latitude: 14.5995,
        longitude: 120.9842,
        address: 'Manila, Philippines'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Emergency alert created:', emergencyResponse.data);
    
    // Test getting active emergencies
    const emergenciesResponse = await axios.get('http://localhost:3000/api/v1/emergencies/active', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Active emergencies:', emergenciesResponse.data);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

testAPI();