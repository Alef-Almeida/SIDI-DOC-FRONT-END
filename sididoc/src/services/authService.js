import api from './api';

export const loginRequest = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// --- NOVO: Busca setores do usuário logado (Endpoint Paginado) ---
export const getMySectors = async () => {
  // Endpoint: /sectors/find-my-sectors (Retorna Page<Sector>)
  const response = await api.get('/sectors/find-my-sectors');
  
  // Tratamento de Segurança:
  // O Spring retorna um objeto Page { content: [...], totalPages: ... }
  // Nós precisamos apenas do array que está dentro de "content"
  if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return response.data.content;
  }
  
  // Caso o backend mude e retorne lista direta um dia, isso garante que funciona
  return Array.isArray(response.data) ? response.data : [];
};

export async function switchSector(sectorId) {
  // Ajuste a URL '/auth' se necessário, dependendo de como está seu Controller
  // O token antigo vai automaticamente no Header pelo interceptor do axios
  const response = await api.post(`/auth/switch-sector/${sectorId}`);
  
  // Retorna o objeto JwtToken (que deve ter um campo .token ou .accessToken)
  return response.data;
};