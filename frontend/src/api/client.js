import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const defaultBaseURL = import.meta.env.PROD
  ? "https://truck-eld-backend-m7w3.onrender.com"
  : "";

const rawBaseURL = configuredBaseURL && !configuredBaseURL.startsWith("/")
  ? configuredBaseURL
  : defaultBaseURL;

const baseURL = rawBaseURL.replace(/\/?api\/?$/, "").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;