import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // On mount, check both storages for a valid token
  useEffect(() => {
    const now = Date.now();
    const localToken = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    if (localToken && expiry && now < Number(expiry)) {
      setToken(localToken);
      setInitializing(false);
      return;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
    }
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      setToken(sessionToken);
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      logout();
    }
  };

  // Always set token in state and storage together
  const login = async (email: string, password: string, remember?: boolean) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      if (remember) {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('token', token);
        localStorage.setItem('token_expiry', expiry.toString());
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, remember?: boolean) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/signup`, {
        email,
        password,
        name
      });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      if (remember) {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('token', token);
        localStorage.setItem('token_expiry', expiry.toString());
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
      }
    } catch (error) {
      throw error;
    }
  };

  // Remove token from both storages on logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put(`${API_BASE}/api/user/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  // Only render children after token check is complete
  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-deep-purple-700">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 