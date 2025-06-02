// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Socket.io Configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const config = {
  API_URL,
  SOCKET_URL,
  GOOGLE_MAPS_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  // API Endpoints
  endpoints: {
    auth: `${API_URL}/api/auth`,
    user: `${API_URL}/api/user`,
    lostFound: `${API_URL}/api/lost-found`,
    profile: `${API_URL}/api/profile`,
    chat: `${API_URL}/api/chat`,
    complaints: `${API_URL}/api/complaints`,
    news: `${API_URL}/api/news`,
    events: `${API_URL}/api/events`,
    facilities: `${API_URL}/api/facilities`,
  }
}; 