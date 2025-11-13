const qrcode = require('qrcode-terminal');
const os = require('os');

// Function to get the local IP address
function getLocalIP() {
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

// Get the local IP address
const localIP = getLocalIP();
const expoUrl = `exp:///${localIP}:19006`;

console.log('HAVEN Mobile App QR Code:');
console.log('Scan this QR code with Expo Go on your mobile device');
console.log('Local IP Address:', localIP);
console.log('Expo URL:', expoUrl);
console.log('');

// Generate and display QR code
qrcode.generate(expoUrl, { small: true }, (qrcode) => {
  console.log(qrcode);
});

console.log('');
console.log('Instructions:');
console.log('1. Make sure your mobile device is on the same network as this computer');
console.log('2. Install Expo Go on your mobile device');
console.log('3. Scan the QR code above with your mobile device camera');
console.log('4. The HAVEN mobile app should load automatically');