import axios from "axios";

// Use environment variable for API base URL, fall back to /api for local development
const baseURL = "https://truck-eld-backend-m7w3.onrender.com";

const api = axios.create({ 
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
