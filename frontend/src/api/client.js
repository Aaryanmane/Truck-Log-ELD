import axios from "axios";

// Use environment variable for API base URL, fall back to /api for local development
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ 
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
