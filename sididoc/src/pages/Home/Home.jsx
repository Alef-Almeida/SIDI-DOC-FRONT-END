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
  FiX
} from "react-icons/fi";

// Serviços
import { getMe, getMySectors, switchSector } from "../../services/authService";
import { 
  getDocumentsBySector, 
  filterDocuments, 
  getCategoriesBySector,
  downloadDocument // <--- IMPORTADO AQUI
} from "../../services/documentService"; 
import api from "../../services/api";

// Componentes
import { ActionCard } from "../../components/ActionCard";

export default function Home() {
  const navigate = useNavigate();

  // === ESTADOS DE DADOS ===
  const [userName, setUserName] = useState("...");
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]); 

  // === ESTADOS VISUAIS ===
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null); // <--- ESTADO NOVO: Indica qual arquivo está baixando

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  
  const sectorDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // === HELPERS DE FORMATAÇÃO ===
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes && bytes !== 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    if (Array.isArray(dateInput)) {
      const [year, month, day] = dateInput;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    return new Date(dateInput).toLocaleDateString("pt-BR");
  };

  // === BUSCA DE DADOS ===
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
    } catch (err) {
      console.warn("Não foi possível carregar categorias.");
    }
  };

  // === HANDLER DE DOWNLOAD ===
  const handleDownloadFile = async (doc) => {
    if (downloadingId) return; // Evita cliques duplos
    
    setDownloadingId(doc.id);
    try {
      // Usa o nome que já está na tabela, ou um fallback
      const fileName = doc.fileName || doc.title || doc.name || `documento-${doc.id}.pdf`;
      await downloadDocument(doc.id, fileName);
    } catch (error) {
      alert("Erro ao baixar o arquivo. Tente novamente.");
    } finally {
      setDownloadingId(null);
    }
  };

  // === INICIALIZAÇÃO ===
  useEffect(() => {
    async function loadInitialData() {
      try {
        const user = await getMe();
        const names = user.name?.trim().split(" ") || [];
        const formattedName = names.length > 1 
          ? `${names[0]} ${names[names.length - 1]}` 
          : names[0] || "Usuário";
        setUserName(formattedName);

        const mySectors = await getMySectors();
        setSectors(mySectors);
        
        if (mySectors.length > 0) {
           setSelectedSector(mySectors[0]); 
        }

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

  // === HANDLERS UI ===
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
    } catch (error) {
      alert("Erro ao trocar setor. Tente relogar.");
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

  const filteredCategoriesForDropdown = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* HEADER STICKY */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <FiFileText className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 hidden xs:block">SIDI-DOC</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative" ref={sectorDropdownRef}>
              <button
                onClick={() => setIsSectorOpen(!isSectorOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm active:bg-gray-100"
              >
                <FiLayers className="text-cyan-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 max-w-[100px] md:max-w-[150px] truncate">
                  {selectedSector ? selectedSector.name : "Setor..."}
                </span>
                <FiChevronDown className="text-gray-400 shrink-0 w-3 h-3 md:w-4 md:h-4" />
              </button>
              
              {isSectorOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-fadeIn">
                  {sectors.map((sec) => (
                    <button 
                      key={sec.id} 
                      onClick={() => handleSelectSector(sec)} 
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-cyan-50 transition ${selectedSector?.id === sec.id ? 'text-cyan-700 font-bold bg-cyan-50' : 'text-gray-600'}`}
                    >
                      {sec.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            
            <div className="text-right hidden md:block">
               <p className="text-[10px] text-gray-500 uppercase tracking-wide">Logado como</p>
               <p className="text-sm font-bold text-gray-800 leading-tight">{userName}</p>
            </div>

            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition active:scale-95">
              <FiLogOut className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Painel de Controle</h2>
          <p className="text-gray-500 text-sm mt-1 flex flex-col sm:flex-row sm:gap-1">
            <span>Gerenciando setor:</span> 
            <strong className="text-cyan-600 truncate">{selectedSector?.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <ActionCard 
            to="/upload" 
            state={{ sector: selectedSector }} 
            icon={FiUploadCloud} 
            title="Fazer Upload" 
            description="Envie novos documentos." 
          />
          <ActionCard 
            to="/consultar" 
            icon={FiSearch} 
            title="Consultar Docs" 
            description="Busca e relatórios." 
            colorClass="text-blue-500" 
            bgClass="bg-blue-50" 
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-700">Documentos Recentes</h3>
            
            <div className="relative w-full md:w-72" ref={categoryDropdownRef}>
              <div 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex items-center justify-between bg-white border px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${isCategoryOpen ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FiFilter className={`shrink-0 ${selectedCategory ? 'text-cyan-600' : 'text-gray-400'}`} size={16} />
                  <span className={`text-sm truncate ${selectedCategory ? 'text-cyan-700 font-medium' : 'text-gray-500'}`}>
                    {selectedCategory ? selectedCategory.name : "Filtrar por Categoria"}
                  </span>
                </div>
                {selectedCategory ? (
                  <button onClick={handleClearCategory} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition">
                    <FiX size={16} />
                  </button>
                ) : (
                  <FiChevronDown size={16} className="text-gray-400" />
                )}
              </div>
              
              {isCategoryOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-fadeIn">
                  <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-2 focus-within:border-cyan-400">
                      <FiSearch className="text-gray-400" size={16} />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Buscar..." 
                        className="w-full text-sm outline-none text-gray-700 bg-transparent"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCategoriesForDropdown.length > 0 ? (
                      filteredCategoriesForDropdown.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-cyan-50 border-b border-gray-50 last:border-0 flex items-center justify-between ${selectedCategory?.id === cat.id ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-gray-600'}`}
                        >
                          {cat.name}
                          {selectedCategory?.id === cat.id && <div className="w-2 h-2 rounded-full bg-cyan-500"></div>}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-sm text-gray-400 text-center">Nenhuma categoria.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50 uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Arquivo</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Categoria</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Data</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Tamanho</th>
                  <th className="px-6 py-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingDocs ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 animate-pulse">Carregando...</td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <FiFileText size={32} className="mb-2 opacity-30" />
                        <p>Nenhum documento.</p>
                        {selectedCategory && <p className="text-xs mt-1 text-red-400">Limpe o filtro.</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded text-gray-500 group-hover:bg-cyan-50 group-hover:text-cyan-600 shrink-0">
                             <FiFileText size={18} />
                          </div>
                          
                          <div className="flex flex-col max-w-[180px] md:max-w-xs">
                            <span className="font-medium text-gray-700 text-sm truncate" title={doc.fileName || doc.title}>
                                {doc.fileName || doc.title || doc.name}
                            </span>
                            <div className="md:hidden flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-400 leading-tight">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{doc.categoryName || "Geral"}</span>
                                <span>•</span>
                                <span>{formatDate(doc.uploadDate || doc.createdAt)}</span>
                                <span>•</span>
                                <span>{formatBytes(doc.fileSize || doc.size || doc.sizeBytes, 0)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 hidden md:table-cell">
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
                           {doc.categoryName || "Geral"}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap hidden md:table-cell">
                        {formatDate(doc.uploadDate || doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap hidden md:table-cell">
                        {formatBytes(doc.fileSize || doc.size || doc.sizeBytes)}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDownloadFile(doc)} 
                          disabled={downloadingId === doc.id}
                          className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition shadow-sm border border-transparent hover:border-cyan-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {/* Troca o ícone se estiver baixando este item específico */}
                          {downloadingId === doc.id ? (
                            <div className="w-[18px] h-[18px] border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiDownload size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!isLoadingDocs && documents.length > 0 && (
             <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-right">
                Total: {documents.length}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}