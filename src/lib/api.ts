import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3010',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', "response.data.access_token");
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string; company?: string }) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default api;