export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://lectura-ai-ungu.onrender.com' 
    : 'http://localhost:5000');