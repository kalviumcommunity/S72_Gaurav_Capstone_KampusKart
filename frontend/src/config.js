const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'; // Replace with your production backend URL when deploying

export { API_BASE }; 