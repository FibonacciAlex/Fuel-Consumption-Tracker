import { tokenStorage } from '../utils/storage';
import { backendUrl } from '../utils/config';

const LoginButton = ({ user, loading, error, login, logout }) => {
  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }
  if (error) {
    return null; // Error is shown in App
  }
  return user ? (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">Hello, {user.name}</span>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  ) : (
    <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">
      Login with Google
    </button>
  );
};

export default LoginButton;