import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocket from './websocket';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api/v1'; // Updated with correct backend IP

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Response interceptor to handle token expiration
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
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    // Connect WebSocket after successful login
    if (response.data.token) {
      websocket.connect(response.data.token);
    }
    return response;
  },
  getProfile: () => apiClient.get('/users/profile'),
};

// Emergencies API
export const emergenciesAPI = {
  createAlert: (alertData) => apiClient.post('/emergencies/alert', alertData),
  getActiveEmergencies: () => apiClient.get('/emergencies/active'),
  updateEmergencyStatus: (emergencyId, status) => apiClient.put(`/emergencies/${emergencyId}`, { status }),
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
    websocket.disconnect();
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

export default apiClient;