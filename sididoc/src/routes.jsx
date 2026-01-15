import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Páginas
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload';
import Consult from './pages/Consult/Consult'; // <--- Já estava importado, mantido.
import SuperAdminDashboard from './pages/Admin/SuperAdminDashboard';
import ResetPassword from './pages/Login/ResetPassword';
import ActivateAccount from './pages/Login/ActivateAccount';

// Serviço
import { getMe } from './services/authService';

// === COMPONENTE DE PROTEÇÃO INTELIGENTE ===
function PrivateRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('sidi_token') || sessionStorage.getItem('sidi_token');
      
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const user = await getMe();
        setUserRole(user.role);

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        localStorage.clear(); 
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  // === LÓGICA DE REDIRECIONAMENTO ===
  if (!authorized) {
    const token = localStorage.getItem('sidi_token') || sessionStorage.getItem('sidi_token');
    if (!token) return <Navigate to="/login" replace />;

    if (userRole === 'SUPER_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/home" replace />;
  }

  return children;
}

// === ROTAS ===
function AppRoutes() {
  const ROLES_OPERACIONAIS = ['OPERATOR', 'ROLE_OPERATOR', 'SECTOR_ADMIN', 'ROLE_SECTOR_ADMIN'];
  const ROLES_ADMIN = ['SUPER_ADMIN', 'ROLE_SUPER_ADMIN'];

  return (
    <BrowserRouter>
      <Routes>
        {/* PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/ativar-conta" element={<ActivateAccount />} />

        {/* === ÁREA OPERACIONAL === */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute allowedRoles={ROLES_OPERACIONAIS}>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <PrivateRoute allowedRoles={ROLES_OPERACIONAIS}>
              <Upload />
            </PrivateRoute>
          } 
        />
        {/* NOVA ROTA ADICIONADA AQUI */}
        <Route 
          path="/consultar" 
          element={
            <PrivateRoute allowedRoles={ROLES_OPERACIONAIS}>
              <Consult />
            </PrivateRoute>
          } 
        />

        {/* === ÁREA ADMINISTRATIVA === */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={ROLES_ADMIN}>
              <SuperAdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Rota Coringa */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;