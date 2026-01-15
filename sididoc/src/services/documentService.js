import api from './api';

// === FUNÇÕES EXISTENTES (Mantidas) ===

// Busca geral (Admin ou Debug)
export async function getAllDocuments(page = 0, size = 10) {
  try {
    const response = await api.get(`/documents/find-all?page=${page}&size=${size}&sort=uploadDate,desc`);
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    throw error;
  }
}

// Upload de Documentos
export async function uploadDocument(formData) {
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Busca Paginada por Setor (Sem filtro de categoria)
export const getDocumentsBySector = async (page = 0, size = 10) => {
  const response = await api.get(`/documents/find-by-sector`, {
    params: {
      page,
      size,
      sort: 'createdAt,desc'
    }
  });
  return response.data;
};

// === NOVAS FUNÇÕES (Adicionadas para o Filtro) ===

// 1. Filtra por Setor E Categoria (Chama seu endpoint @GetMapping("/filter"))
export const filterDocuments = async (sectorId, categoryId) => {
  const response = await api.get(`/documents/filter`, {
    params: {
      sectorId: sectorId,     // Obrigatório no seu endpoint
      categoryId: categoryId  // Obrigatório no seu endpoint
    }
  });
  // Seu endpoint retorna List<DTO> direto, então retornamos data direto
  return response.data; 
};

// 2. Busca Categorias (Mock ou Endpoint Real)
export const getCategoriesBySector = async () => {
  // Se você tiver um endpoint real, descomente a linha abaixo:
  // const response = await api.get('/categories/find-all'); return response.data;
  
  // Por enquanto, retornamos dados falsos para testar o visual:
  return [
    { id: 1, name: "Contratos" },
    { id: 2, name: "Licitações" },
    { id: 3, name: "Financeiro" },
    { id: 4, name: "RH" },
    { id: 5, name: "Ofícios" }
  ];
};

export const downloadDocumentById = async (documentId, fileName) => {
  try {
    const response = await api.get(`/documents/download`, {
      params: { id: documentId },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', fileName || `documento-${documentId}`);

    document.body.appendChild(link);
    link.click();

    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Erro ao baixar documento:", error);
    throw error; 
  }
};