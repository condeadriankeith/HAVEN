import { Platform } from 'react-native';

console.log('=== Network Configuration Test ===');
console.log('Platform:', Platform.OS);
console.log('Environment Variables:');
console.log('REACT_NATIVE_BACKEND_IP:', process.env.REACT_NATIVE_BACKEND_IP);

// Test API URL
const apiEnvUrl = process.env.REACT_NATIVE_BACKEND_IP;
console.log('API URL from env:', apiEnvUrl);

// Test WebSocket URL conversion
if (apiEnvUrl) {
  const wsUrl = apiEnvUrl.replace('http://', 'ws://');
  console.log('WebSocket URL from env:', wsUrl);
}

console.log('=== End Network Configuration Test ===');