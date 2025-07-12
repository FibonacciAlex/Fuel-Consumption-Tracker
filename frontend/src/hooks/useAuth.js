import { useState, useEffect, useCallback } from 'react';
import { backendUrl } from '../utils/config';
import { tokenStorage } from '../utils/storage';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle token in URL (after OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      tokenStorage.setToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch user info
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        tokenStorage.removeToken();
        setUser(null);
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch user info.');
        }
      }
    } catch (err) {
      tokenStorage.removeToken();
      setUser(null);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login: redirect to Google OAuth
  const login = useCallback(() => {
    window.location.href = `${backendUrl}/auth/google`;
  }, []);

  // Logout: call backend, clear token, update state
  const logout = useCallback(async () => {
    try {
      const token = tokenStorage.getToken();
      if (token) {
        await fetch(`${backendUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      // Ignore errors
    } finally {
      tokenStorage.removeToken();
      setUser(null);
      setError(null);
    }
  }, []);

  return { user, loading, error, login, logout, fetchUser };
} 