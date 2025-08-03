// Determine if we're in production based on the hostname
const isProduction = window.location.hostname === 'kampuskart.netlify.app';

// Environment validation
const requiredEnvVars = {
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0 && !isProduction) {
  console.warn('⚠️ Missing environment variables:', missingEnvVars);
  console.warn('Please check your .env file and ensure all required variables are set.');
}

// Base API URL configuration
const API_BASE = isProduction 
  ? 'https://s72-gaurav-capstone.onrender.com' 
  : 'http://localhost:5000';

const SOCKET_URL = isProduction
  ? 'https://s72-gaurav-capstone.onrender.com'
  : 'http://localhost:5000';

export { API_BASE, SOCKET_URL, isProduction }; 