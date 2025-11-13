/**
 * Test script to verify backend connection
 * This script tests the basic connectivity to the backend server
 */

const axios = require('axios');

async function testBackendConnection() {
  console.log('Testing backend connection...');
  
  // Test the base URL
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test basic connectivity
    console.log(`Testing connection to ${baseUrl}...`);
    const response = await axios.get(`${baseUrl}/api/v1/test`, { timeout: 5000 });
    console.log('✓ Basic connectivity test passed');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('✗ Connection refused - server may not be running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('✗ Host not found - check server address');
    } else if (error.code === 'ECONNABORTED') {
      console.log('✗ Connection timeout - server is not responding');
    } else {
      console.log('✓ Server is accessible');
      console.log('Error (this is expected for test endpoint):', error.message);
    }
  }
  
  try {
    // Test login endpoint
    console.log('\nTesting login endpoint...');
    const loginResponse = await axios.post(`${baseUrl}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    }, { timeout: 5000 });
    
    console.log('✓ Login endpoint test passed');
    console.log('Response status:', loginResponse.status);
    console.log('Token received:', !!loginResponse.data.token);
  } catch (error) {
    if (error.response) {
      console.log('✓ Login endpoint accessible');
      console.log('Response status:', error.response.status);
      if (error.response.status === 401) {
        console.log('Login failed - incorrect credentials (this is expected for testing)');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('✗ Connection refused - server may not be running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('✗ Host not found - check server address');
    } else if (error.code === 'ECONNABORTED') {
      console.log('✗ Connection timeout - server is not responding');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }
  
  try {
    // Test registration endpoint
    console.log('\nTesting registration endpoint...');
    // Generate a unique email for testing
    const testEmail = `testuser_${Date.now()}@example.com`;
    
    const registerResponse = await axios.post(`${baseUrl}/api/v1/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phone: '1234567890',
      password: 'testpassword123',
      address: 'Test Address'
    }, { timeout: 5000 });
    
    console.log('✓ Registration endpoint test passed');
    console.log('Response status:', registerResponse.status);
    console.log('User created:', !!registerResponse.data.userId);
  } catch (error) {
    if (error.response) {
      console.log('✓ Registration endpoint accessible');
      console.log('Response status:', error.response.status);
      console.log('Error message:', error.response.data?.error || 'No error message');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('✗ Connection refused - server may not be running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('✗ Host not found - check server address');
    } else if (error.code === 'ECONNABORTED') {
      console.log('✗ Connection timeout - server is not responding');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }
  
  console.log('\n=== Backend Connection Test Complete ===');
}

// Run the test
testBackendConnection().catch(error => {
  console.error('Test failed with error:', error);
});