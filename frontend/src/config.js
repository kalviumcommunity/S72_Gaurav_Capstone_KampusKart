const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://s72-gaurav-capstone.onrender.com' 
  : 'http://localhost:5000';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://s72-gaurav-capstone.onrender.com'
  : 'http://localhost:5000';

// Add a function to get the current API URL
const getApiUrl = () => {
  if (window.location.hostname === 'kampuskart.netlify.app') {
    return 'https://s72-gaurav-capstone.onrender.com';
  }
  return API_BASE;
};

export { getApiUrl as API_BASE, SOCKET_URL }; 