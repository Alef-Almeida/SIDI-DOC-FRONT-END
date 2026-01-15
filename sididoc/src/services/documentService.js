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

// Busca Paginada por Setor
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

// === FUNÇÕES DE FILTRO E CATEGORIA (Atualizadas) ===

// 1. Filtra por Setor E Categoria
export const filterDocuments = async (sectorId, categoryId) => {
  const response = await api.get(`/documents/filter`, {
    params: {
      sectorId: sectorId,
      categoryId: categoryId
    }
  });
  // Seu endpoint de filtro retorna List<DTO> direto (sem paginação)
  return response.data; 
};

export async function downloadDocument(id, fileName) {
  try {
    const response = await api.get('/documents/download', {
      params: { id: id }, // Envia o ID como parâmetro de query
      responseType: 'blob' // CRUCIAL: Diz ao axios que é um arquivo binário
    });

    // Cria um objeto URL temporário para o blob recebido
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Define o nome do arquivo para salvar
    link.setAttribute('download', fileName || 'documento.pdf'); 
    
    // Simula o clique e remove o link
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Erro no download:", error);
    throw error;
  }
}

// 2. Busca Categorias Ativas (AGORA CONECTADO AO BACKEND)
export const getCategoriesBySector = async () => {
  try {
    // ATENÇÃO: Verifique se o nome do seu Controller no Java é 'document-categories' ou 'categories'
    // Adicionei size=100 para garantir que traga todas no dropdown
    const response = await api.get('/documents-categories/find-all?page=0&size=100&sort=name,asc');
    
    // O endpoint Java retorna um Page<DTO>
    // A lista real fica dentro de .content
    if (response.data && response.data.content) {
        return response.data.content;
    }
    
    // Fallback caso mude para lista direta no futuro
    return response.data || [];
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return []; // Retorna lista vazia para não quebrar o front
  }
};