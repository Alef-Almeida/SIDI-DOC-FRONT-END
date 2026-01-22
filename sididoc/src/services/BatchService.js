import api from './api';

export async function findBatchByCode(code) {
    try {
        // Endpoint: /batches/find-by-code?code=XYZ
        const response = await api.get('/batches/find-by-code', {
            params: { code }
        });
        return response.data;
    } catch (error) {
        // Se for 404, retornamos null para tratar no componente
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function createBatch(code, description) {
    const response = await api.post('/batches/create', {
        code,
        description
    });
    return response.data;
}