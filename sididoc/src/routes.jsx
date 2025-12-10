import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login'; // Ajuste o caminho conforme sua pasta
import Home from './pages/Home/Home';    // Importando a Home

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota padrão: redireciona para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota da Home (Dashboard) */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;