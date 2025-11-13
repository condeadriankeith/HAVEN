import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocket from './websocket';

// Base API configuration
// For development, use localhost for web, and computer's IP for mobile devices
// For production, this should be configured via environment variables
const getBaseUrl = () => {
  if (__DEV__) {
    // Check if running on web or mobile
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // For mobile devices, use your computer's IP address
      // Using the IP address we found: 192.168.254.102
      return 'http://192.168.254.102:3000';
    } else {
      // For web browser, use localhost
      return 'http://localhost:3000';
    }
  } else {
    // Production URL
    return 'http://your-production-api-url.com';
  }
};

const API_BASE_URL = getBaseUrl();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and network errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored token
      try {
        await AsyncStorage.removeItem('authToken');
        websocket.disconnect();
      } catch (e) {
        console.log('Error clearing token:', e);
      }
    } else if (!error.response) {
      // Network error
      console.log('Network error:', error.message);
      console.log('Error details:', error);
      // Show a more detailed error message
      console.log('This usually means the app cannot connect to the server.');
      console.log('Please check that:');
      console.log('1. Your device is on the same Wi-Fi network as your computer');
      console.log('2. The server is running on your computer');
      console.log('3. Windows Firewall is not blocking the connection');
      console.log('4. The IP address in api.js is correct');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => apiClient.post('/api/v1/auth/register', userData),
  login: async (credentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    // Store user data in AsyncStorage
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userId', response.data.userId);
      await AsyncStorage.setItem('userName', `${response.data.firstName} ${response.data.lastName}`);
      await AsyncStorage.setItem('userPhone', response.data.phone || '');
      await AsyncStorage.setItem('userEmail', response.data.email);
      // Connect WebSocket after successful login
      websocket.connect(response.data.token);
    }
    return response;
  },
  getProfile: () => apiClient.get('/api/v1/users/profile'),
};

// Emergencies API
export const emergenciesAPI = {
  createAlert: (alertData) => apiClient.post('/api/v1/emergencies/alert', alertData),
  createEmergencyReport: (emergencyData) => apiClient.post('/api/v1/emergencies/alert', emergencyData),
  getActiveEmergencies: () => apiClient.get('/api/v1/emergencies/active'),
  updateEmergencyStatus: (emergencyId, status) => apiClient.put(`/api/v1/emergencies/${emergencyId}`, { status }),
};

// WebSocket service
export const websocketService = websocket;

// Storage functions
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userPhone');
    await AsyncStorage.removeItem('userEmail');
    websocket.disconnect();
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

export default apiClient;