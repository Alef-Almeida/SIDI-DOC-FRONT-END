import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Páginas
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import SuperAdminDashboard from './pages/Admin/SuperAdminDashboard'; // Importe a nova tela

// Serviço para checar role
import { getMe } from './services/authService';

// Componente de Proteção de Rota (Simples)
function PrivateRoute({ children, roleRequired }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getMe();
        // Verifica se tem a role necessária (se especificada)
        if (roleRequired && user.role !== roleRequired) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [roleRequired]);

  if (loading) return <div>Carregando...</div>;
  
  // Se não autorizado, manda pro Login ou Home
  return authorized ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotas de Usuário Comum */}
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<Upload />} />

        {/* === ROTA DO ADMIN === */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute roleRequired="SUPER_ADMIN">
              <SuperAdminDashboard />
            </PrivateRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;