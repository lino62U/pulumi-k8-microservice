import axios from 'axios';

const api = axios.create({
  // The baseURL is intentionally omitted because NGINX routes based on path prefixes.
  // Each service will specify its own path, which NGINX will then route.
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
