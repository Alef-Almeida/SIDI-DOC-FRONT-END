import api from './api';

// Função para buscar todos os documentos (Já existia)
export async function getAllDocuments(page = 0, size = 10) {
  try {
    const response = await api.get(`/documents/find-all?page=${page}&size=${size}&sort=uploadDate,desc`);
    
    // Se for um Page do Spring, retorna o content
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    throw error;
  }
}

// === ESSA É A FUNÇÃO QUE ESTAVA FALTANDO ===
export async function uploadDocument(formData) {
  // O axios gerencia o boundary do multipart automaticamente
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export const getDocumentsBySector = async (page = 0, size = 10) => {
  // Não precisamos passar o sectorId, o Back-end pega do Token!
  const response = await api.get(`/documents/find-by-sector`, {
    params: {
      page,
      size,
      sort: 'createdAt,desc' // Garante a ordenação que o Java pede
    }
  });
  return response.data;
};