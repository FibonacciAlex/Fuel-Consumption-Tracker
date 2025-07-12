import { backendUrl } from './config';
import { tokenStorage } from './storage';

// Helper function to make authenticated API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = tokenStorage.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${backendUrl}${endpoint}`, config);
    
    // If token is invalid, remove it
    if (response.status === 401) {
      tokenStorage.removeToken();
      // You might want to redirect to login or show a message
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Fuel records
  getFuelRecords: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/fuel-records${queryString ? `?${queryString}` : ''}`);
  },

  addFuelRecord: (data) => {
    return apiRequest('/api/fuel-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFuelRecord: (id, data) => {
    return apiRequest(`/api/fuel-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFuelRecord: (id) => {
    return apiRequest(`/api/fuel-records/${id}`, {
      method: 'DELETE',
    });
  },

  // User
  getUserInfo: () => {
    return apiRequest('/auth/user');
  },

  logout: () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
}; 