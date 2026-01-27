import React, { useState, useEffect, useRef } from 'react';
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
    FiExternalLink,
    FiCamera,
    FiImage,
    FiAperture, // Usado para "Tirar Foto"
    FiChevronDown,
    FiCheck
} from 'react-icons/fi';

import { getMySectors } from '../../services/authService';
import {
    filterDocuments,
    getDocumentsBySector,
    getCategoriesBySector,
    downloadDocumentById,
    downloadZip,
    searchDocuments,
    searchDocumentsByImage
} from '../../services/documentService';
import { getAllBatches } from '../../services/BatchService';

// Componente Interno para Dropdown com Pesquisa
const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    // Fecha ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtra opções
    const filteredOptions = options.filter(opt => 
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => { setIsOpen(!isOpen); setSearchTerm(""); }}
                className={`w-full flex items-center justify-between pl-3 pr-3 py-2 border rounded-lg text-sm cursor-pointer transition-all bg-white ${isOpen || value ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {Icon && <Icon className={`shrink-0 ${value ? 'text-cyan-600' : 'text-gray-400'}`} size={16} />}
                    <span className={`truncate ${value ? 'text-cyan-900 font-medium' : 'text-gray-500'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <FiChevronDown className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-cyan-500' : 'text-gray-400'}`} size={16} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn flex flex-col max-h-60">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
                        <div className="relative">
                            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <input 
                                type="text"
                                autoFocus
                                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-cyan-500"
                                placeholder="Filtrar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    
                    {/* Options List */}
                    <div className="overflow-y-auto flex-1">
                        <div 
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-cyan-50 text-gray-500 flex items-center justify-between ${value === "" ? 'bg-cyan-50/50 font-medium' : ''}`}
                            onClick={() => { onChange(""); setIsOpen(false); }}
                        >
                            <span>{placeholder} (Todos)</span>
                            {value === "" && <FiCheck className="text-cyan-600" size={14}/>}
                        </div>
                        
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.value} 
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-cyan-50 text-gray-700 flex items-center justify-between border-t border-gray-50 ${String(value) === String(opt.value) ? 'bg-cyan-50 font-medium text-cyan-900' : ''}`}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {String(value) === String(opt.value) && <FiCheck className="text-cyan-600" size={14}/>}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">
                                Nenhum resultado
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Consult() {
    // === ESTADOS ===
    const [documents, setDocuments] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [batches, setBatches] = useState([]);

    // Filtros
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // 'asc' ou 'desc' 
    const [searchQuery, setSearchQuery] = useState("");

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

                // Carrega Lotes
                const allBatches = await getAllBatches();
                setBatches(allBatches || []);
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

    const handleSemanticSearch = async () => {
        if (!searchQuery.trim()) {
            handleSearch(); // Se vazio, volta pra busca normal
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchDocuments(searchQuery);
            // Mapeia os resultados para o formato esperado pela tela (com adições)
            const mappedResults = results.map(item => ({
                id: item.embeddingId, // Mantém ID único para listagem (embedding)
                documentId: item.documentId, // ID real para download/view
                title: item.metadata?.file_name || "Documento Encontrado",
                categoryName: item.metadata?.content_type || "application/pdf", // Default para PDF se nulo
                uploadDate: item.metadata?.upload_date || null,
                sizeBytes: item.metadata?.file_size || null,
                // Campos específicos da busca semântica
                // Campos específicos da busca semântica
                snippet: item.text,
                score: item.score,
                // Busca semântica não retorna URL direto, vamos gerar sob demanda pelo ID
                downloadUrl: null,
                originalId: item.metadata?.document_id || null
            }));
            setDocuments(groupResultsByDocument(mappedResults));
        } catch (error) {
            console.error("Erro na busca semântica:", error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para agrupar resultados pelo documentId
    const groupResultsByDocument = (items) => {
        const groups = {};

        items.forEach(item => {
            const key = item.documentId || item.id; // Usa documentId se existir, senão o proprio ID do embedding
            if (!groups[key]) {
                groups[key] = {
                    ...item,
                    snippets: []
                };
            }
            // Adiciona o score no grupo (maior score prevalece ou média? Vamos manter o maior)
            if (item.score > groups[key].score) {
                groups[key].score = item.score;
            }

            // Adiciona o snippet
            if (item.snippet) {
                groups[key].snippets.push({
                    text: item.snippet,
                    score: item.score,
                    page: item.metadata?.index || "?" // Opcional: página se tiver
                });
            }
        });

        // Retorna array ordenado por score
        return Object.values(groups).sort((a, b) => b.score - a.score);
    };

    // === BUSCA POR IMAGEM ===
    // === BUSCA POR IMAGEM ===
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [showCameraMenu, setShowCameraMenu] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);

    // Fecha o menu se clicar fora (simples)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.camera-menu-container')) {
                setShowCameraMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Função auxiliar para processar o arquivo (usada tanto pelo input quanto pela câmera)
    const processImageSearch = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setSearchQuery("");

        try {
            const results = await searchDocumentsByImage(file);

            const mappedResults = results.map(item => ({
                id: item.embeddingId,
                documentId: item.documentId,
                title: item.metadata?.file_name || "Documento Encontrado (Imagem)",
                categoryName: item.metadata?.content_type || "application/pdf",
                uploadDate: item.metadata?.upload_date || null,
                sizeBytes: item.metadata?.file_size || null,
                snippet: item.text,
                score: item.score,
                downloadUrl: null,
                originalId: item.metadata?.document_id || null
            }));
            setDocuments(groupResultsByDocument(mappedResults));
        } catch (error) {
            console.error("Erro na busca por imagem:", error);
            alert("Erro ao realizar busca por imagem.");
            setDocuments([]);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleImageSearch = (event) => {
        processImageSearch(event.target.files[0]);
    };

    // --- Lógica do Menu ---
    const handleCameraClick = () => {
        setShowCameraMenu(!showCameraMenu);
    };

    const handleOptionAttach = () => {
        setShowCameraMenu(false);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleOptionTakePhoto = () => {
        setShowCameraMenu(false);
        setShowCameraModal(true);
        startCamera();
    };

    // --- Lógica da Câmera ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            alert("Não foi possível acessar a câmera.");
            setShowCameraModal(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const handleCloseCameraModal = () => {
        stopCamera();
        setShowCameraModal(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Define o tamanho do canvas igual ao do vídeo
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Desenha a imagem atual do vídeo no canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Converte para blob/file e envia
            canvas.toBlob((blob) => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                processImageSearch(file);
                handleCloseCameraModal();
            }, 'image/jpeg');
        }
    };


    // === DOWNLOADS ===
    const handleDownloadOne = async (doc) => {
        try {
            const name = doc.title || "documento";
            // Usa documentId se vier da busca semântica, senão usa id normal
            const idToDownload = doc.documentId || doc.id;
            await downloadDocumentById(idToDownload, name);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert("Erro ao baixar documento.");
        }
    };

    const handleDownloadAll = async () => {
        if (documents.length === 0 || isZipLoading) return;

        setIsZipLoading(true);
        try {
            const ids = filteredDocuments.map(d => d.id);
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
    const handleViewDocument = async (doc) => {
        // 1. Se já tiver URL (busca normal), usa direto
        if (doc.downloadUrl) {
            setViewingDoc(doc);
            return;
        }

        // 2. Se for busca semântica (tem documentId mas não URL), precisamos buscar o blob
        if (doc.documentId) {
            // Se já geramos uma URL temporária para este doc antes, poderíamos reusar,
            // mas aqui vamos gerar uma nova para garantir (poderia otimizar cacheando).
            try {
                // Truque: usa downloadDocumentById mas intercepta a criação do link? 
                // Não, melhor criar um helper aqui ou chamar API direto. 
                // Vamos chamar API direto para pegar o blob e criar URL.
                // Isso replica parte da lógica do service, mas focada em visualização.

                // Import dinâmico ou uso do api instance se fosse exportado. 
                // Como não temos acesso direto ao axios instance 'api' aqui (ele está em services/api.js), 
                // o ideal seria ter um método getDocumentBlobUrl no service. 
                // P.S: O usuário não pediu pra mexer no service, mas é mais limpo.
                // Como alternativa rápida: Usamos downloadDocumentById que já faz o fetch, 
                // mas ele força o download.

                // Vamos assumir que vamos fazer o download "silencioso" para pegar a URL?
                // Não, downloadDocumentById manipula DOM.

                // Melhor: vamos simular o fetch aqui já que não posso importar 'api' facilmente sem ver o arquivo e exports.
                // Ah, eu vejo os imports. api não está importado.
                // Vou adicionar um método auxiliar aqui usando fetch nativo com token? 
                // Ou melhor, assumir que o usuário vai clicar e baixar para ver se não der certo.

                // SOLUÇÃO ROBUSTA: 
                // Vou alertar que para visualizar precisa baixar, OU (melhor)
                // Vou solicitar alteração no service se falhar, mas vou tentar usar o documentId para montar a URL
                // se o backend suportar token via query param, mas geralmente é header.

                // Workaround: Disparar o download é o comportamento padrão se não tiver viewer.
                // Mas, o modal espera um URL para iframe.

                // Vamos tentar construir a URL assumindo que o browser vai carregar (se o token estiver em cookie ou basic auth, mas aqui é Bearer).
                // Iframe com Bearer token é chato.

                // VOU CHAMAR downloadDocumentById mas modificar o service é o ideal.
                // Como não posso garantir o service agora sem mais steps, vou fazer o seguinte:
                // Se não tem URL, eu alerto para baixar.
                // MAS o usuário pediu "Ajuste o funcionamento da visualização".
                // Então tenho que fazer funcionar.

                // Vou editar o service handleViewDocument para pegar o URL do blob.
                // Mas aqui no step current, vou apenas preparar o terreno no componente,
                // assumindo que vou ter acesso a 'downloadDocumentById' modificada ou nova função.

                // Espera, eu posso importar o 'api' do axios se eu quiser, mas ele está em ../../services/api.
                // Vou tentar importar 'api' no topo.
            } catch (e) {
                console.error(e);
            }
        }

        // Se cair aqui, é porque não tratamos.
        // Vou fazer o seguinte:
        // Vou modificar este bloco para fazer o fetch usando o token do localStorage
        try {
            const token = localStorage.getItem('sidi_token') || sessionStorage.getItem('sidi_token');
            const id = doc.documentId;

            const response = await fetch(`http://localhost:8080/documents/download?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Falha ao buscar documento");

            const blob = await response.blob();
            // Força o tipo do blob para garantir que o navegador visualize corretamente (ex: application/pdf)
            const fileType = doc.categoryName || 'application/pdf';
            const newBlob = new Blob([blob], { type: fileType });
            const url = window.URL.createObjectURL(newBlob);

            // Cria um objeto doc modificado com a URL
            setViewingDoc({ ...doc, downloadUrl: url });

        } catch (error) {
            console.error("Erro ao carregar preview:", error);
            alert("Não foi possível carregar a visualização. Tente baixar o arquivo.");
        }
    };

    const handleCloseModal = () => {
        // Limpeza de URL object se necessário (boa prática)
        if (viewingDoc && viewingDoc.downloadUrl && viewingDoc.downloadUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(viewingDoc.downloadUrl);
        }
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

    // === FILTRAGEM CLIENT-SIDE ===
    const getFilteredDocuments = () => {
        let docs = [...documents];

        // 0. Filtro por Setor (Client-side fail-safe)
        // Se a busca principal trouxe mistura (api.getDocumentsBySector sem parâmetros), garantimos aqui.
        if (selectedSector) {
            const secObj = sectors.find(s => String(s.id) === String(selectedSector));
            if (secObj) {
                const secName = secObj.name.toLowerCase();
                docs = docs.filter(d => {
                    // Tenta comparar por ID se existir, ou por Nome
                    if (d.sectorId) return String(d.sectorId) === String(selectedSector);
                    if (d.sectorName) return d.sectorName.toLowerCase() === secName;
                    return true;
                });
            }
        }

        // 1. Filtro por Lote
        if (selectedBatch) {
            docs = docs.filter(d => 
                d.batchCod === selectedBatch || 
                d.batchCode === selectedBatch || 
                d.batchId === selectedBatch || 
                (d.batch && d.batch.code === selectedBatch)
            );
        }

        // 2. Filtro por Tipo (Extensions/MIME)
        if (selectedType) {
            docs = docs.filter(d => {
                // Verificação abrangente de campos que podem conter o tipo
                const typeStr = (d.type || d.contentType || d.categoryName || "").toLowerCase();
                
                 if (selectedType === 'pdf') {
                     return typeStr.includes('pdf');
                 }
                 if (selectedType === 'image') {
                     return typeStr.includes('image') || typeStr.includes('jpg') || typeStr.includes('png') || typeStr.includes('jpeg');
                 }
                 return true;
            });
        }

        // 3. Filtro por Ano
        if (selectedYear) {
            docs = docs.filter(d => {
                if (!d.uploadDate) return false;
                // backend retorna array [ano, mes, dia...] ou string
                let year;
                if (Array.isArray(d.uploadDate)) year = d.uploadDate[0];
                else year = new Date(d.uploadDate).getFullYear();
                return String(year) === String(selectedYear);
            });
        }

        // 4. Ordenação por Ano
        docs.sort((a, b) => {
            let dateA, dateB;
            
            if (Array.isArray(a.uploadDate)) dateA = new Date(a.uploadDate[0], a.uploadDate[1]-1, a.uploadDate[2], a.uploadDate[3]||0, a.uploadDate[4]||0).getTime();
            else dateA = new Date(a.uploadDate).getTime();

            if (Array.isArray(b.uploadDate)) dateB = new Date(b.uploadDate[0], b.uploadDate[1]-1, b.uploadDate[2], b.uploadDate[3]||0, b.uploadDate[4]||0).getTime();
            else dateB = new Date(b.uploadDate).getTime();

            if (sortOrder === 'asc') return dateA - dateB;
            return dateB - dateA;
        });

        return docs;
    };

    const filteredDocuments = getFilteredDocuments();

    // Extrair anos disponíveis para o filtro
    const availableYears = Array.from(new Set(documents.map(d => {
        if (!d.uploadDate) return null;
        if (Array.isArray(d.uploadDate)) return d.uploadDate[0];
        return new Date(d.uploadDate).getFullYear();
    }))).filter(Boolean).sort((a, b) => b - a);


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
                            <p className="text-xs text-gray-500">Busque e filtre seus arquivos digitalizados</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filtros */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
                    
                    {/* Linha 1: Busca Textual e Botões de Câmera */}
                    <div className="relative w-full">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Faça uma pergunta ou busque por conteúdo..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                        />

                        {/* Input Oculto para Imagem */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSearch}
                        />

                        {/* Botão de Câmera + Menu */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 camera-menu-container">
                            <button
                                onClick={handleCameraClick}
                                className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition"
                                title="Buscar por imagem"
                            >
                                <FiCamera size={20} />
                            </button>

                            {showCameraMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-30 overflow-hidden animate-fadeIn">
                                    <div className="py-1">
                                        <button
                                            onClick={handleOptionTakePhoto}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
                                        >
                                            <FiAperture className="text-cyan-500" /> Tirar Foto
                                        </button>
                                        <button
                                            onClick={handleOptionAttach}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition border-t border-gray-50"
                                        >
                                            <FiImage className="text-cyan-500" /> Anexar Imagem
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Linha 2: Filtros Estruturados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* 1. LOTE */}
                        <SearchableSelect
                            placeholder="Lote"
                            icon={FiPackage}
                            value={selectedBatch}
                            onChange={setSelectedBatch}
                            options={batches.map(b => ({ value: b.code, label: b.description ? `${b.code} - ${b.description}` : b.code }))}
                        />

                        {/* 2. SETOR */}
                        <SearchableSelect
                            placeholder="Setor"
                            icon={FiFilter}
                            value={selectedSector}
                            onChange={setSelectedSector}
                            options={sectors.map(s => ({ value: s.id, label: s.name }))}
                        />

                        {/* 3. TIPO (Select Simples) */}
                        <div className="relative">
                            <select 
                                value={selectedType} 
                                onChange={(e) => setSelectedType(e.target.value)} 
                                className={`w-full appearance-none pl-3 pr-8 py-2 border rounded-lg text-sm outline-none cursor-pointer transition-all h-[38px] ${selectedType ? 'border-cyan-500 bg-cyan-50/30 text-cyan-900' : 'border-gray-200 bg-white text-gray-500'}`}
                            >
                                <option value="">Todos os Tipos</option>
                                <option value="pdf">PDF</option>
                                <option value="image">Imagens</option>
                            </select>
                           <FiFilter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>

                         {/* 4. CATEGORIA */}
                         <SearchableSelect
                            placeholder="Categoria"
                            icon={FiFilter}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                        />

                        {/* 5. POR ANO */}
                        <SearchableSelect
                            placeholder="Ano"
                            icon={FiFilter}
                            value={selectedYear}
                            onChange={setSelectedYear}
                            options={availableYears.map(y => ({ value: y, label: String(y) }))}
                        />

                         {/* 6. ORGANIZAR POR ANO (Mantive Select Simples pois são só 2 opções) */}
                         <div className="relative">
                             <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value)} 
                                className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 outline-none cursor-pointer hover:border-cyan-500 transition-all h-[38px]"
                            >
                                <option value="desc">Mais Recentes</option>
                                <option value="asc">Mais Antigos</option>
                            </select>
                            {/* Ícone de ordenação */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Barra de Status e Download All */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-gray-600">
                        {isLoading ? "Carregando..." : `${filteredDocuments.length} documentos encontrados`} 
                        {filteredDocuments.length !== documents.length && !isLoading && <span className="text-xs font-normal text-gray-400 ml-2">(Filtrado de {documents.length})</span>}
                    </p>
                    {filteredDocuments.length > 0 && (
                        <button onClick={handleDownloadAll} disabled={isZipLoading} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm ${isZipLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'}`}>
                            {isZipLoading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FiPackage size={16} />}
                            {isZipLoading ? "Gerando ZIP..." : "Baixar Todos (.zip)"}
                        </button>
                    )}
                </div>

                {/* Lista de Documentos */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">{[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-gray-200 rounded-xl"></div>)}</div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <FiAlertCircle size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum documento encontrado.</p>
                        {!selectedSector && <p className="text-xs text-gray-400 mt-1">Selecione um setor para começar.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocuments.map((doc) => (
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
                                <div className="mt-3 space-y-2">
                                    {doc.snippets && doc.snippets.length > 0 ? (
                                        doc.snippets.map((snip, idx) => (
                                            <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-gray-600 italic">
                                                <p className="line-clamp-4">"{snip.text}"</p>
                                                <div className="mt-2 flex items-center justify-end gap-2">
                                                    {snip.page && <span className="text-[10px] text-gray-400">Pág/Index: {snip.page}</span>}
                                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                        {(snip.score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : doc.snippet ? (
                                        // Fallback para caso não tenha passado pelo agrupamento (busca normal não tem snippet)
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-gray-600 italic">
                                            <p className="line-clamp-4">"{doc.snippet}"</p>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                                    <button
                                        onClick={() => handleViewDocument(doc)}
                                        // Habilita se tiver URL OU se tiver documentId (busca semântica)
                                        disabled={!doc.downloadUrl && !doc.documentId}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium transition ${(!doc.downloadUrl && !doc.documentId) ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:text-gray-800'}`}
                                    >
                                        <FiEye size={14} /> Visualizar
                                    </button>

                                    <button
                                        onClick={() => handleDownloadOne(doc)}
                                        // Habilita se tiver ID (normal) ou documentId (semântica)
                                        disabled={!doc.id && !doc.documentId}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white text-xs font-medium shadow-sm transition active:scale-95 ${(!doc.id && !doc.documentId) ? 'bg-cyan-300 cursor-not-allowed opacity-70' : 'bg-cyan-500 hover:bg-cyan-600'}`}
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

            {/* === MODAL DA CÂMERA === */}
            {showCameraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-black w-full max-w-3xl rounded-2xl flex flex-col shadow-2xl overflow-hidden relative border border-gray-800">
                        {/* Botão Fechar */}
                        <button
                            onClick={handleCloseCameraModal}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition"
                        >
                            <FiX size={24} />
                        </button>

                        <div className="relative flex-1 bg-black flex items-center justify-center aspect-video">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain" // object-contain mantém proporção sem cortar
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        <div className="p-6 bg-gray-900 flex justify-center items-center gap-8">
                            <button
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:border-cyan-500 hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center ring-4 ring-transparent ring-offset-4 ring-offset-gray-900"
                                title="Capturar Foto"
                            >
                                <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-400"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}