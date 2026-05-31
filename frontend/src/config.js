// src/config.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://lectura-ai-ungu.onrender.com' 
    : 'http://localhost:5000');