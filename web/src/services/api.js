import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let authToken = localStorage.getItem('haven_token') || null;

if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('haven_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('haven_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Authenticates as administrator using default backend credentials
 */
export const loginAdmin = async () => {
  try {
    const response = await api.post('/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123',
    });
    if (response.data && response.data.token) {
      setAuthToken(response.data.token);
      return response.data;
    }
  } catch (err) {
    console.warn('Authentication failed:', err.message);
  }
  return null;
};

/**
 * Ensure an active token exists before making authorized requests
 */
async function ensureAuth() {
  if (!authToken) {
    await loginAdmin();
  }
}

/**
 * Fetch all registered users (admin-only)
 */
export const fetchAllUsers = async () => {
  try {
    await ensureAuth();
    const response = await api.get('/api/v1/users');
    return response.data.users || [];
  } catch (err) {
    console.error('Error fetching users:', err.message);
    return [];
  }
};

/**
 * Fetch all currently active emergencies
 */
export const fetchActiveEmergencies = async () => {
  try {
    await ensureAuth();
    const response = await api.get('/api/v1/emergencies/active');
    return response.data.emergencies || [];
  } catch (err) {
    console.error('Error fetching active emergencies:', err.message);
    return [];
  }
};

/**
 * Update the status of an emergency (e.g. RESPONDED, RESOLVED)
 */
export const updateEmergencyStatus = async (emergencyId, status) => {
  try {
    await ensureAuth();
    const response = await api.put(`/api/v1/emergencies/${emergencyId}`, { status });
    return response.data;
  } catch (err) {
    console.error(`Error updating emergency status for ${emergencyId}:`, err.message);
    return null;
  }
};

/**
 * Query aggregated emergency statistics from backend
 */
export const fetchEmergencyStatistics = async () => {
  try {
    await ensureAuth();
    const response = await api.get('/api/v1/emergencies/statistics');
    return response.data;
  } catch (err) {
    console.warn('Error fetching emergency statistics:', err.message);
    return null;
  }
};

/**
 * Calculate driving directions and shortest path route between two points
 */
export const calculateShortestPath = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await api.post('/api/v1/routes/shortest-path', {
      startLat,
      startLng,
      endLat,
      endLng,
    });
    return response.data;
  } catch (err) {
    console.warn('Error calculating route:', err.message);
    return null;
  }
};

/**
 * Create a new emergency alert (used by the web SOS simulator)
 */
export const createEmergencyAlert = async (payload) => {
  try {
    await ensureAuth();
    const response = await api.post('/api/v1/emergencies/alert', payload);
    return response.data;
  } catch (err) {
    console.error('Error creating emergency alert:', err.message);
    throw err;
  }
};

export default api;
