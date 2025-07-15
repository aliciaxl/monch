// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  let hasForcedLogout = false;

  useEffect(() => {
    const handleForceLogout = () => {
    if (!hasForcedLogout) {
      hasForcedLogout = true;
      toast.error("Session expired. Please log in again.");
    }

    setUser(null);
    setLoading(false);
    navigate('/login');
    };

    window.addEventListener('force-logout', handleForceLogout);

    return () => {
      window.removeEventListener('force-logout', handleForceLogout);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await apiClient.get('/whoami/', { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  const login = async (username, password) => {
    await apiClient.post(
      '/login/',
      { username, password },
      { withCredentials: true }
    );
    const res = await apiClient.get('/whoami/', { withCredentials: true });
    setUser(res.data);
  };

  const logout = async () => {
    await apiClient.post('/logout/', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);