import api from './api';

export const loginRequest = async (email, password) => {
  // O JavaScript entende que { email, password } é { email: email, password: password }
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  // Como configuramos o interceptor, o token vai automático
  const response = await api.get('/users/me');
  return response.data; // O backend deve retornar { name: "...", role: "..." }
};

export const getUserSectors = async (userId) => {
  const response = await api.get(`/users/${userId}/sectors`);
  return response.data; // Espera-se um array: [{id: 1, name: "Financeiro"}, ...]
};