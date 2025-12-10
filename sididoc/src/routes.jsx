import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A rota raiz "/" vai carregar o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Se tentar acessar /login, também vai pro Login */}
        <Route path="/login" element={<Login />} />

        {/* Exemplo futuro para Cadastro */}
        {/* <Route path="/cadastro" element={<Cadastro />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;