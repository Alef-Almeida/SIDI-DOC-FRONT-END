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
  FiChevronDown,
  FiLayers,
} from "react-icons/fi";

// === ALTERAÇÃO 1: Importe a função correta ===
import { getMe, getMySectors, switchSector } from "../../services/authService";
import { getDocumentsBySector } from "../../services/documentService"; // <--- NOVO
import api from "../../services/api";
// import { getAllDocuments } from "../../services/documentService"; // <--- REMOVIDO
import { ActionCard } from "../../components/ActionCard";

export default function Dashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [userName, setUserName] = useState("...");
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);

  // ESTADO DOS DOCUMENTOS
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const sectorDropdownRef = useRef(null);

  // === FUNÇÕES AUXILIARES DE FORMATAÇÃO ===
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };
  // ========================================

  // === ALTERAÇÃO 2: Função reutilizável para buscar documentos ===
  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      // Busca os 5 documentos mais recentes do setor atual (via Token)
      const data = await getDocumentsBySector(0, 5);
      
      // O Spring retorna Page<DTO>, então a lista real está em 'content'
      // Se sua API retornar array direto, use 'data' apenas.
      setDocuments(data.content || data || []); 
    } catch (err) {
      console.error("Erro ao buscar documentos do setor", err);
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Dados do Usuário
        getMe()
          .then((userData) => {
            const fullName = userData.name || userData.nome || "";
            const names = fullName.trim().split(" ");
            let formattedName =
              names.length >= 2
                ? `${names[0]} ${names[names.length - 1]}`
                : names[0];
            setUserName(formattedName);
          })
          .catch(() => setUserName("Visitante"));

        // 2. Setores
        getMySectors()
          .then((sectorsData) => {
            setSectors(sectorsData);
            if (sectorsData && sectorsData.length > 0)
              setSelectedSector(sectorsData[0]);
          })
          .catch(() => setSectors([]));

        // 3. DOCUMENTOS REAIS (Agora chama a função nova)
        // === ALTERAÇÃO 3: Chama a função centralizada ===
        await fetchDocuments(); 

      } catch (error) {
        console.error(error);
      }
    }
    fetchData();

    function handleClickOutside(event) {
      if (
        sectorDropdownRef.current &&
        !sectorDropdownRef.current.contains(event.target)
      )
        setIsSectorOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSelectSector = async (sec) => {
    setIsSectorOpen(false);

    try {
      console.log(`Trocando para o setor: ${sec.name} (ID: ${sec.id})...`);

      const jwtData = await switchSector(sec.id);
      const newToken = jwtData.token || jwtData.accessToken;

      if (newToken) {
        localStorage.setItem("sidi_token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        setSelectedSector(sec);

        console.log("Token atualizado. Recarregando documentos...");

        // === ALTERAÇÃO 4: Atualiza a lista IMEDIATAMENTE após trocar setor ===
        await fetchDocuments(); 

      } else {
        console.error("O Back-end não retornou um token válido.");
      }
    } catch (error) {
      console.error("Erro ao trocar de setor:", error);
      alert("Não foi possível trocar de setor. Tente relogar.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-cyan-500 shadow-sm shrink-0">
              <FiFileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block whitespace-nowrap">
              SIDI-DOC
            </h1>
          </div>
          
          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-1 min-w-0">
            <div className="relative" ref={sectorDropdownRef}>
              <button
                onClick={() => setIsSectorOpen(!isSectorOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm max-w-[110px] sm:max-w-[160px] md:max-w-[200px]"
                disabled={sectors.length === 0}
              >
                <div className="p-0.5 md:p-1 bg-cyan-50 rounded text-cyan-600 shrink-0">
                  <FiLayers className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-gray-700 truncate">
                  {selectedSector
                    ? selectedSector.name
                    : sectors.length === 0
                    ? "Sem Setor"
                    : "Setor..."}
                </span>
                <FiChevronDown
                  size={12}
                  className={`text-gray-400 shrink-0 transition-transform ${
                    isSectorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSectorOpen && sectors.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-48 md:w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                  {sectors.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSector(sec)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-cyan-50 transition flex items-center gap-2 truncate ${
                        selectedSector?.name === sec.name
                          ? "text-cyan-600 bg-cyan-50/50"
                          : "text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          selectedSector?.name === sec.name
                            ? "bg-cyan-500"
                            : "bg-gray-300"
                        }`}
                      ></span>
                      <span className="truncate">{sec.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:block h-6 w-px bg-gray-200"></div>
            <div className="flex flex-col items-end min-w-0 shrink-0">
              <span className="text-[10px] md:text-xs font-bold text-gray-700 truncate max-w-[70px] sm:max-w-[120px]">
                <span className="hidden sm:inline">Olá, </span>
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <FiLogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Painel de Controle
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Visualizando setor:{" "}
              <strong className="text-cyan-600">
                {selectedSector?.name || "Nenhum"}
              </strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ActionCard
            to="/upload"
            state={{ sector: selectedSector }}
            icon={FiUploadCloud}
            title="Fazer Upload"
            description="Envie novos documentos para o sistema."
          />
          <ActionCard
            to="/consultar"
            icon={FiSearch}
            title="Consultar Documentos"
            description="Busque e filtre seus arquivos existentes."
            colorClass="text-blue-500"
            bgClass="bg-blue-50"
          />
        </div>

        {/* TABELA DE DOCUMENTOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Documentos Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">
                    Data
                  </th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDocs ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Carregando documentos...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FiFileText className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {doc.fileName || doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(doc.uploadDate || doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {formatBytes(doc.fileSize || doc.size)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition cursor-pointer">
                          <FiDownload size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}