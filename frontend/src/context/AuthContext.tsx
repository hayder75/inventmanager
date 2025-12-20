'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await api.get('/api/auth/verify');
          setUser(response.data);
          // Update saved user data
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error: any) {
          // Only clear if it's a 401 (unauthorized) - token expired
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // For network errors or other issues, use saved user data to maintain session
            try {
              const parsedUser = JSON.parse(savedUser);
              if (parsedUser && parsedUser.id) {
                setUser(parsedUser);
              } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
              }
            } catch (parseError) {
              // If saved user data is invalid, clear everything
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } else if (token) {
        // Have token but no saved user - try to verify
        try {
          const response = await api.get('/api/auth/verify');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } else {
        // No token - clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      // On any error, try to use saved user data
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('user', '');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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

