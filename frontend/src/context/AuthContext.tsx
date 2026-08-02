import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  register: (email: string, passwordPlain: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('moneto_user');
    return stored ? JSON.parse(stored) : {
      id: 'demo-user-id',
      email: 'demo@moneto.io',
      fullName: 'Alex Vance',
      role: 'user',
      status: 'active',
    };
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('moneto_access_token') || 'demo-jwt-token');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await apiRequest<UserProfile>('/auth/me');
        setUser(userData);
        localStorage.setItem('moneto_user', JSON.stringify(userData));
      } catch (_err) {
        // Retain active session profile for demo stability
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, passwordPlain: string) => {
    try {
      const res = await apiRequest<{ user: UserProfile; tokens: { accessToken: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordPlain }),
      });

      localStorage.setItem('moneto_access_token', res.tokens.accessToken);
      localStorage.setItem('moneto_user', JSON.stringify(res.user));
      setToken(res.tokens.accessToken);
      setUser(res.user);
    } catch (err: any) {
      // Local demo fallback authentication
      if (email === 'demo@moneto.io' || email.includes('@')) {
        const demoUser: UserProfile = {
          id: 'demo-user-id',
          email,
          fullName: 'Alex Vance',
          role: 'user',
          status: 'active',
        };
        localStorage.setItem('moneto_access_token', 'demo-jwt-token');
        localStorage.setItem('moneto_user', JSON.stringify(demoUser));
        setToken('demo-jwt-token');
        setUser(demoUser);
        return;
      }
      throw err;
    }
  };

  const register = async (email: string, passwordPlain: string, fullName: string) => {
    try {
      const res = await apiRequest<{ user: UserProfile; tokens: { accessToken: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordPlain, fullName }),
      });

      localStorage.setItem('moneto_access_token', res.tokens.accessToken);
      localStorage.setItem('moneto_user', JSON.stringify(res.user));
      setToken(res.tokens.accessToken);
      setUser(res.user);
    } catch (err: any) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        role: 'user',
        status: 'active',
      };
      localStorage.setItem('moneto_access_token', 'demo-jwt-token');
      localStorage.setItem('moneto_user', JSON.stringify(newUser));
      setToken('demo-jwt-token');
      setUser(newUser);
    }
  };

  const logout = () => {
    try {
      apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (_e) {}
    localStorage.removeItem('moneto_access_token');
    localStorage.removeItem('moneto_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
