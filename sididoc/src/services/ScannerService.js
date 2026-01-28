// src/services/ScannerService.js
import api from './api'; // Importa sua instância configurada com Token

// URL do Agente Local (NAPS2 + Node) - Não muda pois é localhost do usuário
const AGENT_URL = 'http://localhost:8888/scan';

export const ScannerService = {
  /**
   * 1. Pede ao agente local para digitalizar.
   * Retorna um BLOB (o arquivo binário na memória do navegador).
   */
  scanDocument: async () => {
    try {
      // Fetch direto pois o Agente não precisa de Token do SIDI
      const response = await fetch(AGENT_URL);
      
      if (!response.ok) {
        throw new Error('Falha na comunicação com o Scanner Local.');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Erro no Scanner Service:", error);
      throw error;
    }
  },

  /**
   * 2. Envia o BLOB para o Backend Java.
   * Usa a instância 'api' para já levar o Token de autenticação.
   */
  uploadScannedDocument: async (pdfBlob, categoryId) => {
    const formData = new FormData();
    
    // Cria arquivo a partir do Blob
    const file = new File([pdfBlob], `scan_${Date.now()}.pdf`, { type: "application/pdf" });

    // O Backend espera uma LISTA "files" (Baseado no seu Controller atualizado)
    formData.append('files', file); 
    
    // Se tiver categoria, envia. Se não, o Backend gera título automático.
    if (categoryId) {
        formData.append('categoryId', categoryId);
    } else {
        // Fallback caso não tenha categoria selecionada (apenas para não quebrar)
        formData.append('categoryId', 0); 
    }

    // Post via api (já inclui headers: Authorization Bearer ...)
    return api.post('/documents/upload/scanned', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
  }
};