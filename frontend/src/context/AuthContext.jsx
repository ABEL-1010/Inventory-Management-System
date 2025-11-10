import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      console.log('🔐 Stored token:', storedToken);
      
      if (storedToken) {
        setToken(storedToken);
        const userData = await authService.getProfile();
        setUser(userData);
        console.log('✅ User authenticated:', userData);
      } else {
        console.log('❌ No token found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      const userData = await authService.login(email, password);
      console.log('✅ Login successful:', userData);
      
      if (userData && userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(userData.token);
        console.log('💾 Token stored in localStorage');
      } else {
        throw new Error('No token received from login');
      }
      
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token, // ✅ make token accessible
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
