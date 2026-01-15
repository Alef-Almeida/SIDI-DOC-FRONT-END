import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiArrowLeft,
    FiSearch,
    FiFileText,
    FiDownload,
    FiEye,
    FiFilter,
    FiPackage,
    FiAlertCircle,
    FiX,
    FiExternalLink
} from 'react-icons/fi';

import { getMySectors } from '../../services/authService';
import {
    filterDocuments,
    getDocumentsBySector,
    getCategoriesBySector,
    downloadDocumentById,
    downloadZip
} from '../../services/documentService';

export default function Consult() {
    // === ESTADOS ===
    const [documents, setDocuments] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filtros
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Loading
    const [isLoading, setIsLoading] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);

    // Estado para o Modal de Visualização
    const [viewingDoc, setViewingDoc] = useState(null);

    // === 1. CARREGA DADOS INICIAIS ===
    useEffect(() => {
        async function loadInitialData() {
            try {
                const mySectors = await getMySectors();
                setSectors(mySectors);

                const myCategories = await getCategoriesBySector();
                setCategories(myCategories);

                if (mySectors.length > 0) {
                    setSelectedSector(mySectors[0].id);
                }
            } catch (error) {
                console.error("Erro ao carregar filtros", error);
            }
        }
        loadInitialData();
    }, []);

    // === 2. MONITOR DE FILTROS ===
    useEffect(() => {
        if (selectedSector) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSector, selectedCategory]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            let data = [];
            if (selectedCategory) {
                const results = await filterDocuments(selectedSector, selectedCategory);
                data = results || [];
            } else {
                const response = await getDocumentsBySector(0, 50);
                data = response.content || [];
            }
            setDocuments(data);
        } catch (error) {
            console.error("Erro na busca:", error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // === DOWNLOADS ===
    const handleDownloadOne = async (doc) => {
        try {
            const name = doc.title || "documento";
            await downloadDocumentById(doc.id, name);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert("Erro ao baixar documento.");
        }
    };

    const handleDownloadAll = async () => {
        if (documents.length === 0 || isZipLoading) return;

        setIsZipLoading(true);
        try {
            const ids = documents.map(d => d.id);
            const clean = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, '_').toLowerCase();

            const secObj = sectors.find(s => s.id == selectedSector);
            const secName = secObj ? secObj.name : "setor";

            const catObj = categories.find(c => c.id == selectedCategory);
            const catName = catObj ? catObj.name : "";

            let zipName = "";

            if (selectedCategory && catName) {
                zipName = `${clean(catName)}_setor_${clean(secName)}.zip`;
            } else {
                zipName = `documentos_setor_${clean(secName)}.zip`;
            }

            await downloadZip(ids, zipName);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert("Erro ao gerar ZIP.");
        } finally {
            setIsZipLoading(false);
        }
    };

    // === VISUALIZAÇÃO (SIMPLIFICADA) ===
    const handleViewDocument = (doc) => {
        // Como o JSON retorna 'downloadUrl' preenchido, usamos ele direto.
        if (doc.downloadUrl) {
            setViewingDoc(doc);
        } else {
            alert("Este documento não possui link de visualização disponível.");
        }
    };

    const handleCloseModal = () => {
        setViewingDoc(null);
    };

    // === HELPERS DE FORMATAÇÃO ===
    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        let date;

        // O Backend manda array: [2026, 1, 15, 9, 22, 46, 462617000]
        if (Array.isArray(dateInput)) {
            date = new Date(
                dateInput[0],      // Ano
                dateInput[1] - 1,  // Mês (0-11)
                dateInput[2],      // Dia
                dateInput[3] || 0, // Hora
                dateInput[4] || 0  // Minuto
            );
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return "Data Inválida";

        const dia = date.toLocaleDateString('pt-BR');
        const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${dia} às ${hora}`;
    };

    const formatSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb.toFixed(1) + " MB";
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/home" className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-gray-100 transition">
                            <FiArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Consultar Documentos</h1>
                            <p className="text-xs text-gray-500">Busque e acesse seus arquivos digitalizados</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filtros */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Buscar por nome ou tipo..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full">
                            <div className="relative min-w-[200px]">
                                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className={`w-full appearance-none pl-4 pr-10 py-3 border rounded-lg text-sm outline-none cursor-pointer transition-all ${selectedSector ? 'border-cyan-500 ring-1 ring-cyan-500 bg-cyan-50/30 text-cyan-900 font-medium' : 'border-gray-200 bg-white text-gray-500'}`}>
                                    <option value="" disabled>Selecione o Setor</option>
                                    {sectors.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                                </select>
                                <FiFilter className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedSector ? 'text-cyan-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="relative min-w-[200px]">
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`w-full appearance-none pl-4 pr-10 py-3 border rounded-lg text-sm outline-none cursor-pointer transition-all ${selectedCategory ? 'border-cyan-500 ring-1 ring-cyan-500 bg-cyan-50/30 text-cyan-900 font-medium' : 'border-gray-200 bg-white text-gray-500'}`}>
                                    <option value="">Todas as Categorias</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <FiFilter className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedCategory ? 'text-cyan-600' : 'text-gray-400'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de Status e Download All */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-gray-600">{isLoading ? "Carregando..." : `${documents.length} documentos encontrados`}</p>
                    {documents.length > 0 && (
                        <button onClick={handleDownloadAll} disabled={isZipLoading} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm ${isZipLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'}`}>
                            {isZipLoading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FiPackage size={16} />}
                            {isZipLoading ? "Gerando ZIP..." : "Baixar Todos (.zip)"}
                        </button>
                    )}
                </div>

                {/* Lista de Documentos */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">{[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-gray-200 rounded-xl"></div>)}</div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <FiAlertCircle size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum documento encontrado.</p>
                        {!selectedSector && <p className="text-xs text-gray-400 mt-1">Selecione um setor para começar.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {documents.map((doc) => (
                            <div key={doc.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0 border border-cyan-100">
                                            <FiFileText size={22} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {/* Uso correto das chaves do JSON */}
                                            <h3 className="font-bold text-gray-800 text-base truncate" title={doc.title}>
                                                {doc.title || "Sem Título"}
                                            </h3>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs text-gray-500"><span className="font-medium text-gray-400">Tipo:</span> {doc.categoryName || "Geral"}</p>
                                                <p className="text-xs text-gray-500"><span className="font-medium text-gray-400">Data:</span> {formatDate(doc.uploadDate)}</p>
                                                <p className="text-xs text-gray-500"><span className="font-medium text-gray-400">Tam:</span> {formatSize(doc.sizeBytes)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                                    <button
                                        onClick={() => handleViewDocument(doc)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:text-gray-800 transition"
                                    >
                                        <FiEye size={14} /> Visualizar
                                    </button>

                                    <button
                                        onClick={() => handleDownloadOne(doc)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500 text-white text-xs font-medium hover:bg-cyan-600 shadow-sm transition active:scale-95"
                                    >
                                        <FiDownload size={14} /> Baixar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* === MODAL DE VISUALIZAÇÃO === */}
            {viewingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full h-[90vh] max-w-5xl rounded-xl flex flex-col shadow-2xl overflow-hidden animate-scaleIn">

                        {/* Header do Modal */}
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
                                {/* Botão para abrir em nova aba (fallback útil) */}
                                <a
                                    href={viewingDoc.downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                                    title="Abrir em nova aba"
                                >
                                    <FiExternalLink size={20} />
                                </a>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Viewer Iframe */}
                        <div className="flex-1 bg-gray-100 relative">
                            <iframe
                                src={viewingDoc.downloadUrl}
                                title="Document Viewer"
                                className="w-full h-full"
                                frameBorder="0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}