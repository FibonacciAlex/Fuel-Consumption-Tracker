// storage.js
import { backendUrl } from './config';
const API_URL = `${backendUrl}/api/fuel-records`;


const getAuthHeaders = () => {
  const token = tokenStorage.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getFuelRecords = async (startDate, endDate) => {
  try {
    const url = `${API_URL}?startDate=${startDate}&endDate=${endDate}`;
    console.log(`Fetching fuel records from: ${url}`);
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in to view records');
    }
    if (!response.ok) {
      throw new Error('Failed to fetch fuel records');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const saveFuelRecord = async (record) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to save fuel record');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const updateFuelRecord = async (updatedRecord) => {
  try {
    const response = await fetch(`${API_URL}/${updatedRecord.id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRecord),
    });
    if (!response.ok) {
      throw new Error('Failed to update fuel record');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteFuelRecord = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete fuel record');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

// JWT Token storage utilities
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  // Store JWT token in localStorage
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get JWT token from localStorage
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove JWT token from localStorage
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if token exists
  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};