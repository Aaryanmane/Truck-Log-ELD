// Remove the fallback to "/api" if you are not using a proxy
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.error("VITE_API_BASE_URL is not set! Check your environment variables.");
}

const api = axios.create({
  baseURL: baseURL,
  // ... rest of your code
});