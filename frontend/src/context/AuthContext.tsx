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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('moneto_access_token'));
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
      } catch (_err) {
        localStorage.removeItem('moneto_access_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, passwordPlain: string) => {
    const res = await apiRequest<{ user: UserProfile; tokens: { accessToken: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain }),
    });

    localStorage.setItem('moneto_access_token', res.tokens.accessToken);
    setToken(res.tokens.accessToken);
    setUser(res.user);
  };

  const register = async (email: string, passwordPlain: string, fullName: string) => {
    const res = await apiRequest<{ user: UserProfile; tokens: { accessToken: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain, fullName }),
    });

    localStorage.setItem('moneto_access_token', res.tokens.accessToken);
    setToken(res.tokens.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('moneto_access_token');
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
