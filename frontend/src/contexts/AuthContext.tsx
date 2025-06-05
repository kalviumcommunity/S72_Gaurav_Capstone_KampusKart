import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, isProduction } from '../config';

interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  phone?: string;
  major?: string;
  yearOfStudy?: string;
  profilePicture?: { url: string; public_id: string };
  gender?: string;
  dateOfBirth?: string;
  program?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (token: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  // On mount, check both storages for a valid token
  useEffect(() => {
    console.log('AuthContext: Running initial token check effect');
    const now = Date.now();
    const localToken = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    let persistedToken = null;

    if (localToken && expiry && now < Number(expiry)) {
      console.log('AuthContext: Found valid token in localStorage');
      persistedToken = localToken;
    } else {
      console.log('AuthContext: No valid token in localStorage, clearing...');
      // Clear potentially expired or invalid token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
    }

    // If no valid token from localStorage, check sessionStorage
    if (!persistedToken) {
      console.log('AuthContext: No persisted token from localStorage, checking sessionStorage');
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
        console.log('AuthContext: Found token in sessionStorage');
        persistedToken = sessionToken;
      }
    }

    setToken(persistedToken);
    console.log('AuthContext: Set token state to', persistedToken ? 'present' : 'null');
    setInitializing(false);
    console.log('AuthContext: Finished initial token check effect');
  }, []);

  useEffect(() => {
    console.log('AuthContext: Token state changed effect. Current token:', token ? 'present' : 'null');
    if (token) {
      fetchProfile();
      // Set up token refresh
      setupTokenRefresh();
    } else {
      setUser(null);
      // Clear any existing refresh timeout
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        setRefreshTimeout(null);
      }
    }
  }, [token]);

  const setupTokenRefresh = () => {
    // Clear any existing refresh timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    // Set up new refresh timeout (refresh 5 minutes before expiry)
    const timeout = setTimeout(() => {
      refreshToken();
    }, 19 * 60 * 1000); // 19 minutes (assuming 24-hour token expiry)

    setRefreshTimeout(timeout);
  };

  const refreshToken = async () => {
    console.log('AuthContext: Attempting to refresh token');
    try {
      const response = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      console.log('AuthContext: Token refreshed successfully');
    } catch (error) {
      console.error('AuthContext: Error refreshing token:', error);
      logout();
    }
  };

  const fetchProfile = async () => {
    console.log('AuthContext: Attempting to fetch profile with token', token ? 'present' : 'null');
    try {
      const response = await axios.get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      console.log('AuthContext: Profile fetched successfully', response.data);
    } catch (error) {
      console.error('AuthContext: Error fetching profile:', error);
      setUser(null);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
         logout();
      }
    }
  };

  // Always set token in state and storage together
  const login = async (email: string, password: string, remember?: boolean) => {
    try {
      // Frontend validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Password validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      console.log('Attempting login with email:', email);
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.toLowerCase(),
        password
      });
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      // Always save token to localStorage with expiry for persistent login
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem('token', token);
      localStorage.setItem('token_expiry', expiry.toString());
      sessionStorage.removeItem('token');
      console.log('AuthContext: Saved token to localStorage (Remember Me)');
    } catch (error) {
      console.error('Login error details:', error.response?.data);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.data?.details) {
          const details = error.response.data.details;
          const errorMessages = Object.entries(details)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(errorMessages);
        }
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, remember?: boolean) => {
    try {
      console.log('AuthContext: Starting signup process');
      
      // Frontend validation
      if (!email || !password || !name) {
        console.log('AuthContext: Missing required fields');
        throw new Error('All fields are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('AuthContext: Invalid email format');
        throw new Error('Invalid email format');
      }

      // Password strength validation
      if (password.length < 8) {
        console.log('AuthContext: Password too short');
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/[A-Z]/.test(password)) {
        console.log('AuthContext: Password missing uppercase');
        throw new Error('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(password)) {
        console.log('AuthContext: Password missing lowercase');
        throw new Error('Password must contain at least one lowercase letter');
      }

      if (!/[0-9]/.test(password)) {
        console.log('AuthContext: Password missing number');
        throw new Error('Password must contain at least one number');
      }

      if (!/[!@#$%^&*]/.test(password)) {
        console.log('AuthContext: Password missing special character');
        throw new Error('Password must contain at least one special character (!@#$%^&*)');
      }

      // Name validation
      if (name.trim().length < 2) {
        console.log('AuthContext: Name too short');
        throw new Error('Name must be at least 2 characters long');
      }

      console.log('AuthContext: Making signup request to', `${API_BASE}/api/auth/signup`);
      const response = await axios.post(`${API_BASE}/api/auth/signup`, {
        email: email.toLowerCase(),
        password,
        name: name.trim()
      });

      console.log('AuthContext: Signup response received', response.data);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      
      // Always save token to localStorage with expiry for persistent login
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem('token', token);
      localStorage.setItem('token_expiry', expiry.toString());
      sessionStorage.removeItem('token');
      console.log('AuthContext: Token saved to localStorage');
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      if (axios.isAxiosError(error)) {
        console.error('AuthContext: Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.data?.details) {
          const details = error.response.data.details;
          const errorMessages = Object.entries(details)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to the server. Please make sure the backend server is running.');
        }
      }
      throw error;
    }
  };

  // Remove token from both storages on logout
  const logout = () => {
    console.log('AuthContext: Logging out, clearing storage and state');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
    console.log('AuthContext: Logout complete');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const formData = new FormData();
      for (const key in data) {
          if (data[key as keyof Partial<User>] !== undefined) {
              if (key === 'dateOfBirth') {
                   formData.append(key, data[key] === null ? '' : data[key] as string);
              } else if (key === 'profilePicture' && data[key]) {
                   formData.append(key, data[key] as Blob);
          } else {
                formData.append(key, String(data[key]));
              }
          }
      }

      const response = await axios.put(`${API_BASE}/api/profile`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
        }
      });
      setUser(response.data);
      console.log('AuthContext: Profile updated successfully', response.data);
    } catch (error) {
      console.error('AuthContext: Error updating profile:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => {
    console.log('AuthContext: Initiating Google login');
    const backendUrl = isProduction 
      ? 'https://s72-gaurav-capstone.onrender.com'
      : 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleGoogleCallback = async (token: string) => {
    setToken(token);
    try {
      const response = await axios.get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      // Always save token to localStorage with expiry for persistent login
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem('token', token);
      localStorage.setItem('token_expiry', expiry.toString());
      sessionStorage.removeItem('token');
      console.log('AuthContext: Saved token to localStorage (Remember Me)');
      return response.data;
    } catch (error) {
      console.error('AuthContext: Error handling Google callback profile fetch:', error);
      setUser(null);
      logout();
      throw error;
    }
  };

  // Only render children after token check is complete
  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-deep-purple-700">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      signup, 
      loginWithGoogle,
      handleGoogleCallback,
      logout, 
      updateProfile,
      loading: initializing,
      refreshToken
    }}>
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