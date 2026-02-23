import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'https://incrime-backend.onrender.com';
axios.defaults.baseURL = API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('incrime_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      if (data.success) setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { username, password });
      if (data.success) {
        localStorage.setItem('incrime_token', data.token);
        setToken(data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed. Please check your credentials.' };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post('/api/auth/register', formData);
      if (data.success) {
        localStorage.setItem('incrime_token', data.token);
        setToken(data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('incrime_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
