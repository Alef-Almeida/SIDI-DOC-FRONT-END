import api from './api';

export const loginRequest = async (email, password) => {
  // O JavaScript entende que { email, password } é { email: email, password: password }
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};