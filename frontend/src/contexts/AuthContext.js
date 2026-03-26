import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('mnc_token'));

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('mnc_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
        withCredentials: true
      });
      setUser(response.data);
      setToken(storedToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('mnc_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('mnc_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name, role = 'brand') => {
    const response = await axios.post(`${API}/auth/register`, { email, password, name, role });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('mnc_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleOAuthCallback = async (sessionId) => {
    const response = await axios.post(`${API}/auth/session`, { session_id: sessionId }, { withCredentials: true });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('mnc_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('mnc_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    isAdmin,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('mnc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default AuthContext;
