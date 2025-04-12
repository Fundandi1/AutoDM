import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Set default headers for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const response = await authAPI.getProfile();
        
        if (response.data.user) {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ email, password });
      
      const { token, user } = response.data;
      
      // Save token and set user
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending registration data:', userData);
      console.log('API URL:', authAPI.getBaseURL ? authAPI.getBaseURL() : 'Not available');
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      // Save token and set user
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      setError(err.response?.data?.message || 'An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if needed
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token and reset state regardless of API success
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 