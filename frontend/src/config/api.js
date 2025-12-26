// API Configuration
// Uses environment variable in production, falls back to proxy in development

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = {
  get: (url) => {
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
    return require('axios').get(fullUrl);
  },
  post: (url, data, config = {}) => {
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
    return require('axios').post(fullUrl, data, config);
  }
};

export default api;

