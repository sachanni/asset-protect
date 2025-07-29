import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await apiRequest('/api/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await apiRequest('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        if (data.token) {
          await AsyncStorage.setItem('authToken', data.token);
        }
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData: any) => {
    try {
      // Step 1: Register personal info
      const step1Response = await apiRequest('/api/register/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          dateOfBirth: userData.dateOfBirth,
          mobileNumber: userData.mobileNumber,
          countryCode: userData.countryCode || '+91',
          address: userData.address,
        }),
      });

      if (!step1Response.ok) {
        const error = await step1Response.json();
        return { success: false, error: error.message };
      }

      // Step 2: Register account info
      const step2Response = await apiRequest('/api/register/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await step2Response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}