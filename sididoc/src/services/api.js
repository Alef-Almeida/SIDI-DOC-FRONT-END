import axios from 'axios';

const api = axios.create({
  // Ajuste a porta conforme seu backend Java (Spring Boot geralmente é 8080)
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  }
});

// INTERCEPTOR: Cola o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sidi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;