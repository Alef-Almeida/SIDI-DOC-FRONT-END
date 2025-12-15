import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiFileText, 
  FiUploadCloud, 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiDownload, 
  FiLogOut,
  FiChevronDown, // Ícone da setinha
  FiLayers       // Ícone para representar "Setor"
} from "react-icons/fi";

import { getMe, getUserSectors } from "../../services/authService";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Estados de UI
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false); // Dropdown do setor
  
  // Estados de Dados
  const [userName, setUserName] = useState("Carregando...");
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);

  // Ref para fechar o dropdown se clicar fora (Opcional, mas melhora a UX)
  const sectorDropdownRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Busca dados do usuário
        const userData = await getMe();
        
        // Formata o nome
        const fullName = userData.name || userData.nome || ""; 
        const names = fullName.trim().split(' ');
        let formattedName = names.length >= 2 
            ? `${names[0]} ${names[names.length - 1]}` 
            : names[0];
        setUserName(formattedName);

        // 2. Se tiver ID, busca os setores
        if (userData.id) {
            try {
                const sectorsData = await getUserSectors(userData.id);
                setSectors(sectorsData);
                
                // Seleciona o primeiro setor automaticamente se houver
                if (sectorsData && sectorsData.length > 0) {
                    setSelectedSector(sectorsData[0]);
                }
            } catch (secErr) {
                console.error("Erro ao buscar setores:", secErr);
                // Fallback visual se falhar
                setSectors([]); 
                setSelectedSector({ name: "Setor Padrão" });
            }
        }

      } catch (error) {
        console.error("Erro geral ou offline:", error);
        const savedName = localStorage.getItem("sidi_user_name");
        setUserName(savedName || "Usuário");
      }
    }

    fetchData();

    // Fecha dropdown ao clicar fora
    function handleClickOutside(event) {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sidi_token");
    localStorage.removeItem("sidi_user_name");
    navigate("/login");
  };

  const handleSelectSector = (sector) => {
    setSelectedSector(sector);
    setIsSectorOpen(false);
    console.log("Setor alterado para:", sector.name);
    // Aqui você pode salvar no localStorage ou Context se precisar usar em outras telas
  };

  // Dados Mockados para a tabela
  const documents = [
    { id: 1, name: "Contrato.pdf", date: "05/12/2024", size: "2.4 MB" },
    { id: 2, name: "Invoice_001.pdf", date: "04/12/2024", size: "1.8 MB" },
    { id: 3, name: "Relatório_Q4.pdf", date: "03/12/2024", size: "3.2 MB" },
    { id: 4, name: "Certificado.pdf", date: "02/12/2024", size: "0.9 MB" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* 1. LADO ESQUERDO: LOGO (Fixo) */}
          <div className="flex items-center gap-3 w-48"> 
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500 shadow-sm">
              <FiFileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">SIDI-DOC</h1>
          </div>

          {/* 2. CENTRO: NAVEGAÇÃO (Centralizada) */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center gap-8 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
              <Link to="/home" className="text-cyan-600 font-semibold text-sm hover:text-cyan-700 transition">Dashboard</Link>
              <Link to="/consultar" className="text-gray-500 font-medium text-sm hover:text-cyan-600 transition">Consultar</Link>
              <Link to="/upload" className="text-gray-500 font-medium text-sm hover:text-cyan-600 transition">Upload</Link>
            </nav>
          </div>

          {/* 3. LADO DIREITO: USUÁRIO + SETOR + LOGOUT */}
          <div className="flex items-center justify-end gap-4 w-auto md:w-48">
            
            {/* DROPDOWN DE SETORES */}
            <div className="relative hidden md:block" ref={sectorDropdownRef}>
                <button 
                    onClick={() => setIsSectorOpen(!isSectorOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                    <div className="p-1 bg-cyan-50 rounded text-cyan-600">
                        <FiLayers size={14} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                        {selectedSector ? selectedSector.name : "Setor..."}
                    </span>
                    <FiChevronDown size={14} className={`text-gray-400 transition-transform ${isSectorOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Lista do Dropdown */}
                {isSectorOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                        {sectors.length > 0 ? (
                            sectors.map((sec) => (
                                <button
                                    key={sec.id || sec.name}
                                    onClick={() => handleSelectSector(sec)}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-cyan-50 transition flex items-center gap-2
                                        ${selectedSector?.name === sec.name ? 'text-cyan-600 bg-cyan-50/50' : 'text-gray-600'}
                                    `}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedSector?.name === sec.name ? 'bg-cyan-500' : 'bg-gray-300'}`}></span>
                                    {sec.name}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-xs text-gray-400 text-center">Nenhum setor encontrado</div>
                        )}
                    </div>
                )}
            </div>

            {/* Separador Vertical */}
            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            {/* Nome do Usuário */}
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-700">Olá, {userName}</span>
            </div>
              
            {/* Logout */}
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                <FiLogOut size={18} />
            </button>

            {/* Botão Mobile (Menu Hamburguer) */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* --- MENU MOBILE (ADAPTADO) --- */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3 shadow-lg absolute w-full left-0 z-40">
            <Link to="/home" className="block py-2 text-cyan-600 font-medium">Dashboard</Link>
            <Link to="/consultar" className="block py-2 text-gray-600">Consultar</Link>
            <Link to="/upload" className="block py-2 text-gray-600">Upload</Link>
            
            <div className="py-2 border-t border-gray-100 mt-2 space-y-3">
                {/* Setores no Mobile */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Seu Setor</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                         <FiLayers className="text-cyan-500" />
                         {selectedSector ? selectedSector.name : "Nenhum setor"}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Logado como <strong>{userName}</strong></span>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium text-sm">
                        <FiLogOut size={16} /> Sair
                    </button>
                </div>
            </div>
          </div>
        )}
      </header>

      {/* --- CONTEÚDO PRINCIPAL (Sem alterações) --- */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Boas vindas + Setor Atual (Opcional, para reforçar) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Painel de Controle</h2>
            <p className="text-gray-500 text-sm mt-1">
                Visualizando documentos do setor: <strong className="text-cyan-600">{selectedSector?.name || "..."}</strong>
            </p>
          </div>
        </div>

        {/* ... Resto do seu código (Cards e Tabela) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           {/* Cards e Tabela mantidos iguais... */}
           <Link to="/upload" className="group">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-cyan-400 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-cyan-50 rounded-full group-hover:bg-cyan-100 transition">
                  <FiUploadCloud className="w-6 h-6 text-cyan-500" />
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
                  <FiSearch className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Consultar Documentos</h3>
              </div>
              <p className="text-gray-500 text-sm">Busque e filtre seus arquivos existentes.</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Documentos Recentes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50">
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
                        <FiFileText className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.size}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition cursor-pointer" title="Baixar">
                        <FiDownload size={18} />
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