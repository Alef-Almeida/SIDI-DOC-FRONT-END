import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  }
});

// INTERCEPTOR: Procura token nos dois lugares
api.interceptors.request.use((config) => {
  // ORDEM: Tenta Local (Persistente) -> Se não achar, tenta Session (Temporário)
  const token = localStorage.getItem('sidi_token') || sessionStorage.getItem('sidi_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;