console.log('=== Environment Variable Debug ===');
console.log('EXPO_PUBLIC_BACKEND_IP:', process.env.EXPO_PUBLIC_BACKEND_IP);

// Test the WebSocket URL generation
const envBaseUrl = process.env.EXPO_PUBLIC_BACKEND_IP;
if (envBaseUrl) {
  const wsUrl = envBaseUrl.replace('http://', 'ws://');
  console.log('Generated WebSocket URL:', wsUrl);
} else {
  console.log('No environment variable found');
}
console.log('=== End Debug ===');