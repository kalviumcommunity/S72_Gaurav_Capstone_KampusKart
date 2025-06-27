import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import SkeletonLoader from './SkeletonLoader';
import axios from 'axios';

const imageUrl = '/login-side.jpg';

const RightPanel: React.FC = () => (
  <div className="hidden md:flex flex-1 items-center justify-center bg-black/10">
    <img src={imageUrl} alt="Panel" className="object-cover w-full h-full" />
  </div>
);

const accent = 'from-deep-purple-500 to-hot-pink-500';
const accentText = 'text-deep-purple-600';
const accentBtn = 'bg-gradient-to-r from-deep-purple-500 to-hot-pink-500';
const accentBtnHover = 'hover:from-hot-pink-500 hover:to-deep-purple-500';
const accentFocus = 'focus:ring-deep-purple-400';

const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength ? `Password must be at least ${minLength} characters` : '',
      upperCase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : '',
      lowerCase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : '',
      numbers: !hasNumbers ? 'Password must contain at least one number' : '',
      specialChar: !hasSpecialChar ? 'Password must contain at least one special character (!@#$%^&*)' : ''
    }
  };
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validation = validatePassword(newPassword);
    setPasswordErrors(validation.errors);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail) ? '' : 'Please enter a valid email address');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting signup process...');
    
    // Validate email and password
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      console.log('Email validation failed');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      console.log('Password validation failed:', passwordValidation.errors);
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      console.log('Name validation failed');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Attempting to signup with:', { email, name });
      await signup(email, password, name, remember);
      console.log('Signup successful, navigating to home...');
      navigate('/home');
    } catch (err: any) {
      console.error('Signup error details:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.data?.details) {
          const details = err.response.data.details;
          const errorMessages = Object.entries(details)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          setError(errorMessages);
        } else if (err.code === 'ECONNREFUSED') {
          setError('Cannot connect to the server. Please make sure the backend server is running.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans px-4">
        <SkeletonLoader variant="signup" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen h-screen flex font-sans bg-white">
      {/* Left: Signup Form */}
      <div className="flex flex-col items-center w-full md:w-1/2 px-8 py-8 bg-white rounded-2xl shadow-lg overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src="/Logo.png" alt="KampusKart Logo" className="h-12 w-12 object-contain" style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className="text-h4 font-extrabold text-black tracking-tight font-sans">Kampuskart</span>
          </div>
          <h2 className="mb-6 text-h3 font-bold text-black text-center pt-6">Sign Up</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-orange/10 p-4">
                <div className="text-sm text-orange-700">{error}</div>
              </div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border-b border-gray-300 focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-10 pr-3 py-3 border-b ${emailError ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent`}
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && emailError) {
                      e.preventDefault();
                    }
                  }}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`block w-full pl-10 pr-10 py-3 border-b ${Object.keys(passwordErrors).length > 0 ? 'border-red-500' : 'border-gray-300'} focus:border-black focus:ring-0 text-black placeholder-gray-400 bg-transparent`}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white text-black`}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ transition: 'color 0.2s' }}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
                {Object.keys(passwordErrors).length > 0 && (
                  <div className="mt-1 space-y-1">
                    {Object.values(passwordErrors).map((error, index) => (
                      error && <p key={index} className="text-sm text-red-500">{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mr-2"
                  />
                  Remember me
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-semibold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] hover:text-white transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full text-lg font-semibold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>

            <div className="text-center text-sm mt-6 text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#F05A25] font-semibold hover:underline">Login</Link>
            </div>
          </form>
        </div>
      </div>
      {/* Right: Image Panel */}
      <RightPanel />
    </div>
  );
};

export default Signup; 
