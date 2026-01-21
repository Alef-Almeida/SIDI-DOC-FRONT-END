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

export const getCategoriesBySector = async () => {
  try {
    const response = await api.get('/documents-categories/find-all', {
      params: {
        page: 0,
        size: 100,
        sort: 'name,asc'
      }
    });

    return response.data.content || [];

  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
};

export const downloadDocumentById = async (documentId, fallbackName) => {
  try {
    const response = await api.get(`/documents/download`, {
      params: { id: documentId },
      responseType: 'blob',
    });

    let fileName = fallbackName;

    const disposition = response.headers['content-disposition'];

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
      }
    }

    if (!fileName.includes(".")) {
      const type = response.headers['content-type'];
      if (type === 'application/pdf') fileName += ".pdf";
      else if (type === 'image/jpeg') fileName += ".jpg";
      else if (type === 'image/png') fileName += ".png";
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();

    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Erro ao baixar documento:", error);
    throw error;
  }
};

export const downloadZip = async (documentIds, customName = null) => {
  try {
    const idsParam = documentIds.join(',');

    const response = await api.get(`/documents/download-zip`, {
      params: { ids: idsParam },
      responseType: 'blob',
    });

    let fileName = customName;

    if (!fileName) {
      fileName = "documentos_sidi_doc.zip";
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
          try { fileName = decodeURIComponent(fileName); } catch (e) { }
        }
      }
    }

    if (!fileName.toLowerCase().endsWith(".zip")) {
      fileName += ".zip";
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();

    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Erro ao baixar ZIP:", error);
    throw error;
  }
};

export const searchDocuments = async (query) => {
  try {
    const response = await api.post('/documents/search', { query });
    return response.data;
  } catch (error) {
    console.error("Erro na busca semântica:", error);
    throw error;
  }
};

export const searchDocumentsByImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/documents/search-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro na busca por imagem:", error);
    throw error;
  }
};
