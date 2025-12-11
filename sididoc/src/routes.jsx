import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importando as páginas
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Upload from './pages/Upload/Upload'; // <--- Adicionado o import correto

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz redireciona para Login ou carrega Login direto */}
        <Route path="/" element={<Login />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />} />

        {/* Aqui usamos o componente <Upload /> que importamos */}
        <Route path="/upload" element={<Upload />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;