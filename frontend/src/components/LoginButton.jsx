import { useState, useEffect } from 'react';
import { backendUrl } from '../utils/config';

const LoginButton = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info from the backend
    fetch(`${backendUrl}/auth/user`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleLogout = () => {
    fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => setUser(null))
      .catch((error) => console.error('Logout failed:', error));
  };

  return user ? (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">Hello, {user.name}</span>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  ) : (
    <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
      Login with Google
    </button>
  );
};

export default LoginButton;