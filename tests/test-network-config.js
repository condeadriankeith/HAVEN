const fs = require('fs');
const path = require('path');

console.log('=== HAVEN Network Configuration Test ===');

// Test if .env files exist
const mobileEnvPath = path.join(__dirname, 'mobile', '.env');
const desktopEnvPath = path.join(__dirname, 'desktop', '.env');

console.log('\n1. Checking environment files...');

if (fs.existsSync(mobileEnvPath)) {
  console.log('✓ Mobile .env file exists');
  const mobileEnvContent = fs.readFileSync(mobileEnvPath, 'utf8');
  console.log('  Content:', mobileEnvContent.trim());
} else {
  console.log('✗ Mobile .env file not found');
}

if (fs.existsSync(desktopEnvPath)) {
  console.log('✓ Desktop .env file exists');
  const desktopEnvContent = fs.readFileSync(desktopEnvPath, 'utf8');
  console.log('  Content:', desktopEnvContent.trim());
} else {
  console.log('✗ Desktop .env file not found');
}

// Test IP address detection
console.log('\n2. Testing IP address detection...');

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  for (const name of ['Wi-Fi', 'Ethernet']) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (!net.internal && net.family === 'IPv4') {
          return net.address;
        }
      }
    }
  }
  
  // Fallback to localhost
  return 'localhost';
}

const detectedIP = getLocalIP();
console.log('Detected IP:', detectedIP);

// Test server connectivity
console.log('\n3. Testing server connectivity...');

const http = require('http');

// Test if server is running on port 3000
const options = {
  hostname: detectedIP === 'localhost' ? 'localhost' : detectedIP,
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✓ Server responded with status code: ${res.statusCode}`);
  console.log('✓ Network configuration appears to be working correctly');
  console.log('\n=== Test Complete ===');
});

req.on('error', (e) => {
  console.log('✗ Server connection failed:', e.message);
  console.log('Troubleshooting steps:');
  console.log('1. Make sure the backend server is running');
  console.log('2. Check that both devices are on the same network');
  console.log('3. Verify Windows Firewall is not blocking port 3000');
  console.log('4. Ensure the IP address in .env files is correct');
  console.log('\n=== Test Complete ===');
});

req.on('timeout', () => {
  console.log('✗ Server connection timed out');
  req.destroy();
  console.log('\n=== Test Complete ===');
});

req.end();