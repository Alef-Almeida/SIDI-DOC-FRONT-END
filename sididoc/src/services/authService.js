import api from './api';

export const loginRequest = async (email, senha) => {
  // Post para o endpoint do seu Java.
  const response = await api.post('/login', { email, senha });
  return response.data;
};