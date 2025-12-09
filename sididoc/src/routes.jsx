import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Aqui importaremos as páginas depois. Ex: import Login from './pages/Login';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial de exemplo */}
        <Route path="/" element={<h1>Home do SIDI-DOC</h1>} />
        
        {/* Exemplo de futura rota: */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;