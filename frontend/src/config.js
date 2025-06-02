const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://s72-gaurav-capstone.onrender.com' 
  : 'http://localhost:5000';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://s72-gaurav-capstone.onrender.com'
  : 'http://localhost:5000';

export { API_BASE, SOCKET_URL }; 