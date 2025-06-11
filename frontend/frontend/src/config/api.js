import axios from 'axios';

const getToken = () => {
  return sessionStorage.getItem('jwt_token');
};

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the Authorization header if the token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle response or errors
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    // Handle specific error code
    if (error.response.status === 401) {
      console.log('Token expired, please login again');

      // Remove token from sessionStorage
      sessionStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

const { get, post, put, delete: destroy, patch } = apiClient;
export { get, post, put, destroy, patch };

