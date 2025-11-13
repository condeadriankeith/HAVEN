const axios = require('axios');

async function testNetworkConnectivity() {
  console.log('Testing network connectivity to HAVEN server...');
  
  const testCases = [
    { name: 'Localhost', url: 'http://localhost:3000/api/v1/auth/login' },
    { name: 'Local IP', url: 'http://192.168.254.102:3000/api/v1/auth/login' },
    { name: '127.0.0.1', url: 'http://127.0.0.1:3000/api/v1/auth/login' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\nTesting ${testCase.name} (${testCase.url})...`);
      const response = await axios.post(testCase.url, {
        email: 'admin@example.com',
        password: 'admin123'
      }, { timeout: 5000 });
      
      console.log(`✓ ${testCase.name} test passed: Status ${response.status}`);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`✗ ${testCase.name} test failed: Connection timeout`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`✗ ${testCase.name} test failed: Host not found`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`✗ ${testCase.name} test failed: Connection refused`);
      } else if (error.response) {
        console.log(`✓ ${testCase.name} connection successful: Status ${error.response.status}`);
      } else {
        console.log(`✗ ${testCase.name} test failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n=== Network Test Complete ===');
}

testNetworkConnectivity();