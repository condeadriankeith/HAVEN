import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    console.error('Failed to log in as admin:', err.message);
  }
  return null;
};

export const fetchAllUsers = async () => {
  try {
    if (!authToken) {
      await loginAdmin();
    }
    const response = await api.get('/api/v1/users');
    return response.data.users || [];
  } catch (err) {
    console.error('Error fetching users:', err.message);
    return [];
  }
};

export const fetchActiveEmergencies = async () => {
  try {
    if (!authToken) {
      await loginAdmin();
    }
    const response = await api.get('/api/v1/emergencies/active');
    return response.data.emergencies || [];
  } catch (err) {
    console.error('Error fetching active emergencies:', err.message);
    return [];
  }
};

export const updateEmergencyStatus = async (emergencyId, status) => {
  try {
    if (!authToken) {
      await loginAdmin();
    }
    const response = await api.put(`/api/v1/emergencies/${emergencyId}`, { status });
    return response.data;
  } catch (err) {
    console.error('Error updating emergency status:', err.message);
    return null;
  }
};

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
    console.error('Error calculating route:', err.message);
    return null;
  }
};

export default api;
