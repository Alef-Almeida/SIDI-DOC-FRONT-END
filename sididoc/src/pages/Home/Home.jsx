import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Upload, Search, Menu, X, Download, LogOut } from "lucide-react";

// Simulação simples de dados e usuário (Depois conectamos com seu authService)
const user = { name: "Flavio" }; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // Aqui você limparia o token do localStorage
    navigate("/");
  };

  const documents = [
    { id: 1, name: "Contrato.pdf", date: "05/12/2024", size: "2.4 MB" },
    { id: 2, name: "Invoice_001.pdf", date: "04/12/2024", size: "1.8 MB" },
    { id: 3, name: "Relatório_Q4.pdf", date: "03/12/2024", size: "3.2 MB" },
    { id: 4, name: "Certificado.pdf", date: "02/12/2024", size: "0.9 MB" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">SIDI-DOC</h1>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-cyan-600 font-medium">Dashboard</Link>
              <Link to="/consultar" className="text-gray-600 hover:text-cyan-600 transition">Consultar</Link>
              <Link to="/upload" className="text-gray-600 hover:text-cyan-600 transition">Upload</Link>
            </nav>
            
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <span className="text-sm font-medium text-gray-700">Olá, {user.name}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Botão Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3 shadow-lg absolute w-full left-0">
            <Link to="/dashboard" className="block py-2 text-cyan-600 font-medium">Dashboard</Link>
            <Link to="/consultar" className="block py-2 text-gray-600">Consultar</Link>
            <Link to="/upload" className="block py-2 text-gray-600">Upload</Link>
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-500 w-full text-left">
              <LogOut size={18} /> Sair
            </button>
          </div>
        )}
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Boas vindas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo ao Painel</h2>
          <p className="text-gray-500">Gerencie seus documentos digitalizados de forma simples.</p>
        </div>

        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link to="/upload" className="group">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-cyan-400 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-cyan-50 rounded-full group-hover:bg-cyan-100 transition">
                  <Upload className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Fazer Upload</h3>
              </div>
              <p className="text-gray-500 text-sm">Envie novos documentos para o sistema.</p>
            </div>
          </Link>

          <Link to="/consultar" className="group">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-cyan-400 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Consultar Documentos</h3>
              </div>
              <p className="text-gray-500 text-sm">Busque e filtre seus arquivos existentes.</p>
            </div>
          </Link>
        </div>

        {/* Tabela de Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Documentos Recentes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Data</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Tamanho</th>
                  <th className="px-6 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.size}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition" title="Baixar">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}