// API Configuration
// Uses environment variable in production, falls back to proxy/redirects in development
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes default timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

