import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiUploadCloud,
  FiSearch,
  FiLogOut,
  FiChevronDown,
  FiLayers,
  FiFilter,
  FiDownload,
  FiX,
  FiPackage,
  FiExternalLink // FiEye removido pois não é mais usado na tabela
} from "react-icons/fi";

import { getMe, getMySectors, switchSector } from "../../services/authService";
import {
  getDocumentsBySector,
  filterDocuments,
  getCategoriesBySector,
  downloadDocumentById,
  downloadZip
} from "../../services/documentService";
import api from "../../services/api";
import { ActionCard } from "../../components/ActionCard";

export default function Dashboard() {
  const navigate = useNavigate();

  // === ESTADOS ===
  const [userName, setUserName] = useState("...");
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Estado do Modal
  const [viewingDoc, setViewingDoc] = useState(null);

  const sectorDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // === FORMATADORES ===
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes && bytes !== 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    let date;
    if (Array.isArray(dateInput)) {
      date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    } else {
      date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) return "Data Inválida";
    const dia = date.toLocaleDateString('pt-BR');
    const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
  };

  // === BUSCAS ===
  const fetchDocuments = async (catId = null) => {
    setIsLoadingDocs(true);
    try {
      let data = [];
      if (catId) {
        if (!selectedSector?.id) return;
        const list = await filterDocuments(selectedSector.id, catId);
        data = list || [];
      } else {
        const pageData = await getDocumentsBySector(0, 10);
        data = pageData.content || pageData || [];
      }
      setDocuments(data);
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await getCategoriesBySector();
      setCategories(cats || []);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.warn("Não foi possível carregar categorias.");
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        const user = await getMe();
        const names = user.name?.trim().split(" ") || [];
        const formattedName = names.length > 1 ? `${names[0]} ${names[names.length - 1]}` : names[0] || "Usuário";
        setUserName(formattedName);

        const mySectors = await getMySectors();
        setSectors(mySectors);

        if (mySectors.length > 0) setSelectedSector(mySectors[0]);

        await fetchCategories();
        await fetchDocuments(null);
      } catch (error) {
        console.error("Erro na inicialização:", error);
      }
    }
    loadInitialData();

    function handleClickOutside(event) {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) setIsSectorOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setIsCategoryOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === HANDLERS ===
  const handleSelectSector = async (sec) => {
    setIsSectorOpen(false);
    try {
      const jwtData = await switchSector(sec.id);
      const newToken = jwtData.token || jwtData.accessToken;
      if (newToken) {
        localStorage.setItem("sidi_token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        setSelectedSector(sec);
        setSelectedCategory(null);
        setCategorySearch("");
        await fetchCategories();
        await fetchDocuments(null);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Erro ao trocar setor.");
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setIsCategoryOpen(false);
    setCategorySearch("");
    fetchDocuments(cat.id);
  };

  const handleClearCategory = (e) => {
    e.stopPropagation();
    setSelectedCategory(null);
    fetchDocuments(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDownload = async (doc) => {
    try {
      const fileName = doc.title || "documento";
      await downloadDocumentById(doc.id, fileName);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Erro ao iniciar o download.");
    }
  };

  const handleViewDocument = (doc) => {
    if (doc.downloadUrl) {
      setViewingDoc(doc);
    } else {
      alert("Este documento não possui visualização disponível.");
    }
  };

  const handleCloseModal = () => {
    setViewingDoc(null);
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0 || isDownloadingZip) return;

    setIsDownloadingZip(true);
    try {
      const ids = documents.map(d => d.id);
      const clean = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, '_').toLowerCase();

      const secName = selectedSector ? selectedSector.name : "setor";
      const catName = selectedCategory ? selectedCategory.name : "";

      let zipName = "";
      if (selectedCategory) {
        zipName = `${clean(catName)}_setor_${clean(secName)}.zip`;
      } else {
        zipName = `documentos_setor_${clean(secName)}.zip`;
      }

      await downloadZip(ids, zipName);

    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o arquivo ZIP.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const filteredCategoriesForDropdown = categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-sm"><FiFileText size={20} /></div>
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">SIDI-DOC</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={sectorDropdownRef}>
                <button onClick={() => setIsSectorOpen(!isSectorOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm">
                  <FiLayers className="text-cyan-600" />
                  <span className="text-xs font-semibold text-gray-700 max-w-[150px] truncate">{selectedSector ? selectedSector.name : "Selecionar Setor..."}</span>
                  <FiChevronDown size={14} className="text-gray-400" />
                </button>
                {isSectorOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                      {sectors.map((sec) => (
                          <button key={sec.id} onClick={() => handleSelectSector(sec)} className={`w-full text-left px-4 py-2.5 text-xs hover:bg-cyan-50 transition ${selectedSector?.id === sec.id ? 'text-cyan-700 font-bold bg-cyan-50' : 'text-gray-600'}`}>{sec.name}</button>
                      ))}
                    </div>
                )}
              </div>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Logado como</p>
                <p className="text-sm font-bold text-gray-800">{userName}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition"><FiLogOut size={20} /></button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Painel de Controle</h2>
            <p className="text-gray-500 text-sm mt-1">Gerenciando documentos do setor: <strong className="text-cyan-600">{selectedSector?.name}</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <ActionCard to="/upload" state={{ sector: selectedSector }} icon={FiUploadCloud} title="Fazer Upload" description="Envie novos documentos para o sistema." />
            <ActionCard to="/consultar" icon={FiSearch} title="Consultar Documentos" description="Busca avançada e relatórios." colorClass="text-blue-500" bgClass="bg-blue-50" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-700">Documentos Recentes</h3>
                {documents.length > 0 && (
                    <button onClick={handleDownloadAll} disabled={isDownloadingZip} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition border ${isDownloadingZip ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 shadow-sm'}`}>
                      {isDownloadingZip ? <><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>Gerando ZIP...</> : <><FiPackage size={14} />Baixar Todos (.zip)</>}
                    </button>
                )}
              </div>
              <div className="relative w-full sm:w-72" ref={categoryDropdownRef}>
                <div onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`flex items-center justify-between bg-white border px-3 py-2 rounded-lg cursor-pointer transition select-none ${isCategoryOpen ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FiFilter className={`shrink-0 ${selectedCategory ? 'text-cyan-600' : 'text-gray-400'}`} size={16} />
                    <span className={`text-sm truncate ${selectedCategory ? 'text-cyan-700 font-medium' : 'text-gray-500'}`}>{selectedCategory ? selectedCategory.name : "Filtrar por Categoria"}</span>
                  </div>
                  {selectedCategory ? <button onClick={handleClearCategory} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"><FiX size={14} /></button> : <FiChevronDown size={16} className="text-gray-400" />}
                </div>
                {isCategoryOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fadeIn">
                      <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1.5 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-200">
                          <FiSearch className="text-gray-400" size={14} />
                          <input autoFocus type="text" placeholder="Buscar categoria..." className="w-full text-xs outline-none text-gray-700 placeholder-gray-400 bg-transparent" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {filteredCategoriesForDropdown.length > 0 ? filteredCategoriesForDropdown.map(cat => (
                            <button key={cat.id} onClick={() => handleSelectCategory(cat)} className={`w-full text-left px-4 py-2 text-xs hover:bg-cyan-50 transition flex items-center justify-between ${selectedCategory?.id === cat.id ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-gray-600'}`}>
                              {cat.name}
                              {selectedCategory?.id === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>}
                            </button>
                        )) : <div className="px-4 py-6 text-xs text-gray-400 text-center">Nenhuma categoria encontrada.</div>}
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* === TABELA ATUALIZADA === */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50 uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Nome do Arquivo</th>
                  <th className="px-6 py-3 font-semibold hidden sm:table-cell">Categoria</th>
                  <th className="px-6 py-3 font-semibold hidden sm:table-cell">Data</th>
                  <th className="px-6 py-3 font-semibold hidden sm:table-cell">Tamanho</th>
                  <th className="px-6 py-3 font-semibold text-right">Ação</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {isLoadingDocs ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 animate-pulse">Carregando documentos...</td></tr>
                ) : documents.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center flex flex-col items-center justify-center text-gray-400"><FiFileText size={32} className="mb-2 opacity-30" /><p>Nenhum documento encontrado.</p>{selectedCategory && <p className="text-xs mt-1 text-red-400">Tente limpar o filtro.</p>}</td></tr>
                ) : (
                    documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* === ÍCONE AGORA É UM BOTÃO CLICKÁVEL PARA VISUALIZAR === */}
                              <button
                                  onClick={() => handleViewDocument(doc)}
                                  className="bg-gray-100 p-2 rounded text-gray-500 hover:bg-cyan-100 hover:text-cyan-600 transition cursor-pointer"
                                  title="Clique para visualizar o documento"
                              >
                                <FiFileText size={16} />
                              </button>

                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700 text-sm" title={doc.title}>{doc.title || "Sem Título"}</span>
                                <span className="text-[10px] text-gray-400 sm:hidden">{formatDate(doc.uploadDate)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{doc.categoryName || "Geral"}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{formatDate(doc.uploadDate)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{formatBytes(doc.sizeBytes)}</td>

                          {/* === AÇÃO APENAS DOWNLOAD (OLHO REMOVIDO) === */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleDownload(doc)} className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition cursor-pointer" title="Baixar">
                                <FiDownload size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
            {!isLoadingDocs && documents.length > 0 && <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-right">Mostrando {documents.length} registros</div>}
          </div>
        </main>

        {/* === MODAL DE VISUALIZAÇÃO === */}
        {viewingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white w-full h-[90vh] max-w-5xl rounded-xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-100 flex items-center justify-center text-cyan-600">
                      <FiFileText />
                    </div>
                    <div className="min-w-0 max-w-[60%]">
                      <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{viewingDoc.title}</h3>
                      <p className="text-xs text-gray-500">Modo de visualização</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={viewingDoc.downloadUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition" title="Abrir em nova aba"><FiExternalLink size={20} /></a>
                    <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><FiX size={24} /></button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 relative">
                  <iframe src={viewingDoc.downloadUrl} title="Document Viewer" className="w-full h-full" frameBorder="0" />
                </div>
              </div>
            </div>
        )}
      </div>
  );
}