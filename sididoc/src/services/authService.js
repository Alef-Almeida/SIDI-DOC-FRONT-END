import api from './api';

// 1. Login atualizado com parâmetro "rememberMe"
export const loginRequest = async (email, password, rememberMe = false) => {
  // Limpa qualquer token velho antes de tentar
  localStorage.removeItem("sidi_token");
  sessionStorage.removeItem("sidi_token");

  const response = await api.post('/auth/login', { email, password });
  
  // Pega o token (garantindo compatibilidade com token ou accessToken)
  const token = response.data.token || response.data.accessToken;

  if (token) {
    if (rememberMe) {
      localStorage.setItem("sidi_token", token); // Salva pra sempre (Lembre-me)
    } else {
      sessionStorage.setItem("sidi_token", token); // Salva só na sessão (Aba)
    }
  }
  
  return response.data;
};

// Endpoint baseado na imagem: @PostMapping("/complete-registration")
export const completeRegistration = async (token, newPassword) => {
  // Ajuste a URL se o seu endpoint não estiver dentro de /auth
  const response = await api.post('/auth/complete-registration', {
    token: token,
    newPassword: newPassword
  });
  return response.data;
};

// Endpoint baseado na imagem: @PostMapping("/request-password-reset")
export const requestPasswordReset = async (email) => {
  // O Java espera um objeto, provavelmente um DTO com campo email
  const response = await api.post('/auth/request-password-reset', { email });
  return response.data;
};

// Endpoint baseado na imagem: @PostMapping("/reset-password") com ResetPasswordDTO
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    token: token,
    newPassword: newPassword
  });
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