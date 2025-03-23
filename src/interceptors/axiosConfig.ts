import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { token, type } = JSON.parse(auth).data;
      config.headers.Authorization = `${type} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      //window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  },
);

export default api;
