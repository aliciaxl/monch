// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from cookies using whoami
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