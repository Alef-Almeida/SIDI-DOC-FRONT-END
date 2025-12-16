import api from './api';

// ============================================================
// GESTÃO DE USUÁRIOS (UserController)
// ============================================================

export const registerUser = async (userData) => {
  // Endpoint: POST /users/register
  // Payload: { name, email, role, sectorIds: [...] }
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const getAllUsers = async () => {
  try {
    // Endpoint: GET /users/find-all (Retorna List<UserResponseDTO>)
    const response = await api.get('/users/find-all'); 
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn("Erro ao listar usuários (/users/find-all):", error);
    return [];
  }
};

// Vincula usuário ao setor
// Controller: POST /users/add-to-sector com @RequestBody UserSectorDTO
export const addUserToSector = async (email, sectorCode) => {
  const response = await api.post('/users/add-to-sector', { 
    email: email, 
    code: sectorCode 
  });
  return response.data;
};

// ============================================================
// GESTÃO DE SETORES (SectorController)
// ============================================================

export const getAllSectors = async () => {
  try {
    // Endpoint: GET /sectors/find-all-active (Retorna Page<SectorResponseDTO>)
    const response = await api.get('/sectors/find-all-active'); 
    
    // Tratamento para Spring Data Page (extrai o content)
    if (response.data && response.data.content) {
        return response.data.content;
    }
    // Fallback se retornar lista direta
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    return [];
  }
};

export const createSector = async (sectorData) => {
  // Endpoint: POST /sectors/create
  const response = await api.post('/sectors/create', sectorData);
  return response.data;
};

export const deleteSector = async (id) => {
  // Endpoint: DELETE /sectors/soft-delete?id=...
  const response = await api.delete(`/sectors/soft-delete?id=${id}`);
  return response.data;
};

// ============================================================
// GESTÃO DE CATEGORIAS (DocumentCategoryController)
// ============================================================

export async function getAllCategories() {
  // Adicionei ?size=100 para garantir que traga todas as categorias no dropdown,
  // já que o padrão do seu controller é trazer apenas 24 por página.
  const response = await api.get('/documents-categories/find-all?size=100');
  
  // CORREÇÃO:
  // Se a resposta tiver a propriedade 'content', é uma Paginação do Spring Boot.
  // Retornamos apenas o array que está dentro de 'content'.
  if (response.data && response.data.content) {
      return response.data.content; 
  }

  // Caso contrário, retorna os dados normais (caso mude o back no futuro)
  return response.data;
}

export const createCategory = async (categoryData) => {
  // Endpoint: POST /documents-categories/save
  const response = await api.post('/documents-categories/save', categoryData);
  return response.data;
};

export const disableCategory = async (name) => {
  // Endpoint: DELETE /documents-categories/disable/{name}
  const response = await api.delete(`/documents-categories/disable/${name}`);
  return response.data;
};