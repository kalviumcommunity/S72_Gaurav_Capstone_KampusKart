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

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, remember?: boolean) => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (token: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

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
    } else {
      setUser(null);
    }
  }, [token]);

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
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });
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
      // Always save token to localStorage with expiry for persistent login
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        localStorage.setItem('token', token);
        localStorage.setItem('token_expiry', expiry.toString());
        sessionStorage.removeItem('token');
      console.log('AuthContext: Saved token to localStorage (Remember Me)');
    } catch (error) {
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
              } 
              else {
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
      loading: initializing
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