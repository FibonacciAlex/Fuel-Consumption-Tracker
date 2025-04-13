// storage.js
const API_URL = 'http://localhost:5000/api/fuel-records';

export const getFuelRecords = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API_URL}?startDate=${startDate}&endDate=${endDate}`, {
      credentials: 'include', // Include cookies for authentication
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    });
    if (!response.ok) {
      throw new Error('Failed to delete fuel record');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};