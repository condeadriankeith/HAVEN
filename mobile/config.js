// Config file to handle environment variables in Expo
// Simple React Native compatible approach

const CONFIG = {
  // API Base URL - will be set from environment or fallback to your computer's IP
  API_BASE_URL: process.env.EXPO_PUBLIC_BACKEND_IP || 'http://172.20.10.3:3000',
  
  // WebSocket URL - derived from API_BASE_URL
  get WEBSOCKET_URL() {
    if (this.API_BASE_URL) {
      return this.API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    }
    return 'ws://172.20.10.3:3000';
  }
};

export default CONFIG;