import api from './api';

// === GESTÃO DE USUÁRIOS ===
export const registerUser = async (userData) => {
  // userData: { name, email, role }
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users'); 
  return response.data;
};

// === GESTÃO DE SETORES (Com Code e Description) ===
export const getAllSectors = async () => {
  const response = await api.get('/sectors'); 
  return response.data;
};

export const createSector = async (sectorData) => {
  // sectorData: { name, code, description }
  const response = await api.post('/sectors/create', sectorData);
  return response.data;
};

export const deleteSector = async (id) => {
  const response = await api.delete(`/sectors/soft-delete/${id}`);
  return response.data;
};

export const addUserToSector = async (userId, sectorId) => {
  const response = await api.post('/sectors/add-to-sector', { userId, sectorId });
  return response.data;
};

// === GESTÃO DE CATEGORIAS (Com Description) ===
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  // categoryData: { name, description }
  const response = await api.post('/categories/save', categoryData);
  return response.data;
};

export const disableCategory = async (name) => {
  const response = await api.patch(`/categories/disable/${name}`);
  return response.data;
};