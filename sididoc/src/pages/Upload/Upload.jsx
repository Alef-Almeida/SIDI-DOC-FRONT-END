import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiUploadCloud, FiLayers, FiCheckCircle, FiPackage,
  FiLoader, FiInfo, FiFileText, FiTrash2, FiEye, FiCpu, FiAlertCircle, FiX, FiTag, FiZap,
  FiPrinter
} from "react-icons/fi";

// Serviços
import { getAllCategories } from "../../services/adminService";
import { getMySectors } from "../../services/authService";
import { findBatchByCode, createBatch } from "../../services/batchService";
import { uploadDocument, analyzeDocumentCategory } from "../../services/documentService";
import { ScannerModal } from "../../components/ScannerModal";

// Componentes
import { PageHeader } from "../../components/PageHeader";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { FileDropzone } from "../../components/FileDropzone";

export default function Upload() {
  const location = useLocation();

  // Estados
  const [currentSector, setCurrentSector] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [globalCategoryId, setGlobalCategoryId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // UI
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Lote
  const [useBatch, setUseBatch] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [batchDescription, setBatchDescription] = useState("");
  const [isCheckingBatch, setIsCheckingBatch] = useState(false);
  const [batchExists, setBatchExists] = useState(false);

  // Modal Preview
  const [previewDoc, setPreviewDoc] = useState(null);

  const MAX_FILE_SIZE_MB = 50;

  function getSectorIdFromToken() {
    try {
      const token = localStorage.getItem("sidi_token");
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload).sectorId;
    } catch (error) { return null; }
  }

  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const cats = await getAllCategories();
        setCategoriesList(cats || []);

        if (location.state && location.state.sector) {
          setCurrentSector(location.state.sector);
        } else {
          const mySectors = await getMySectors();
          if (mySectors && mySectors.length > 0) {
            const activeId = getSectorIdFromToken();
            const activeSector = activeId ? mySectors.find(s => s.id === Number(activeId)) : mySectors[0];
            setCurrentSector(activeSector || mySectors[0]);
          }
        }
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados iniciais.' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [location.state]);

  useEffect(() => {
    if (!useBatch) {
      setBatchCode("");
      setBatchDescription("");
      setBatchExists(false);
    }
  }, [useBatch]);

  async function handleBatchCodeBlur() {
    if (!batchCode.trim()) {
      setBatchExists(false);
      setBatchDescription("");
      return;
    }
    setIsCheckingBatch(true);
    try {
      const foundBatch = await findBatchByCode(batchCode.trim());
      if (foundBatch) {
        setBatchExists(true);
        setBatchDescription(foundBatch.description || "Lote sem descrição");
      } else {
        setBatchExists(false);
        setBatchDescription("");
      }
    } catch (error) {
      setBatchExists(false);
      setBatchDescription("");
    } finally {
      setIsCheckingBatch(false);
    }
  }

  // === HANDLERS DE ARQUIVO ===

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      previewUrl: URL.createObjectURL(file),
      categoryId: globalCategoryId || "",
      isAnalyzing: false
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setFeedback({ type: '', message: '' });
  }

  function removeFile(id) {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  }

  function updateFileCategory(id, newCategoryId) {
    setGlobalCategoryId("");
    setSelectedFiles(prev => prev.map(f =>
        f.id === id ? { ...f, categoryId: newCategoryId } : f
    ));
  }

  function handleGlobalCategoryChange(e) {
    const newCat = e.target.value;
    setGlobalCategoryId(newCat);
    if (newCat) {
      setSelectedFiles(prev => prev.map(f => ({ ...f, categoryId: newCat })));
    }
  }

  function handleScanComplete(file) {
    // Aproveita sua função handleFiles existente!
    // Ela espera uma lista (FileList ou Array), então passamos array
    handleFiles([file]); 
}

  // === IA ===

  // Analisa UM arquivo
  async function handleAnalyzeSingle(fileId) {
    setGlobalCategoryId("");
    setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, isAnalyzing: true } : f));

    const fileItem = selectedFiles.find(f => f.id === fileId);
    if (!fileItem) return;

    const suggestion = await analyzeDocumentCategory(fileItem.file);

    setSelectedFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          // Se achou, substitui. Se não achou, mantém o que estava antes.
          categoryId: suggestion.found ? suggestion.id : f.categoryId,
          isAnalyzing: false
        } : f
    ));
  }

  // Analisa TODOS (CORRIGIDO: Roda mesmo se já tiver categoria)
  async function handleAutoCategorizeAll() {
    setIsAnalyzingAll(true);
    setGlobalCategoryId(""); // Reseta o seletor global visualmente

    const updatedFiles = [...selectedFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];

      // MUDANÇA AQUI: Removida a verificação "if (!item.categoryId)".
      // Agora ele analisa sempre, sobrescrevendo a escolha manual.

      // 1. Marca como analisando
      setSelectedFiles(prev => prev.map(f => f.id === item.id ? { ...f, isAnalyzing: true } : f));

      // 2. Chama API
      const suggestion = await analyzeDocumentCategory(item.file);

      // 3. Atualiza estado
      setSelectedFiles(prev => prev.map(f =>
          f.id === item.id ? {
            ...f,
            // Se a IA achar, põe a ID dela. Se não achar, mantém o que o usuário tinha posto.
            categoryId: suggestion.found ? suggestion.id : f.categoryId,
            isAnalyzing: false
          } : f
      ));
    }
    setIsAnalyzingAll(false);
  }

  async function handleFinalUpload() {
    // A validação do botão já impede chegar aqui se o lote for inválido, mas mantemos por segurança
    if (useBatch && (!batchCode.trim() || (!batchExists && !batchDescription.trim()))) {
      setFeedback({ type: 'error', message: 'Dados do lote inválidos.' });
      return;
    }

    if (selectedFiles.some(f => !f.categoryId)) {
      setFeedback({ type: 'error', message: 'Classifique todos os documentos antes de enviar.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    try {
      if (useBatch && batchCode.trim() && !batchExists) {
        await createBatch(batchCode.trim(), batchDescription.trim());
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const formData = new FormData();
        formData.append("files", item.file);
        formData.append("categoryId", item.categoryId);

        if (useBatch && batchCode.trim()) {
          formData.append("batchCode", batchCode.trim());
        }

        await uploadDocument(formData);
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      setFeedback({ type: 'success', message: 'Todos os documentos foram enviados com sucesso!' });
      setSelectedFiles([]);
      setGlobalCategoryId("");

    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Erro no upload. Verifique o console.' });
    } finally {
      setIsUploading(false);
    }
  }

  // === VALIDAÇÃO DO LOTE PARA O BOTÃO ===
  // O botão fica desativado se:
  // 1. Estiver carregando upload
  // 2. Não tiver arquivos
  // 3. Lote marcado MAS (Código vazio OU (Lote novo E Descrição vazia) OU Verificando)
  const isBatchInvalid = useBatch && (
      !batchCode.trim() ||
      (!batchExists && !batchDescription.trim()) ||
      isCheckingBatch
  );

  // === MODAL LOCAL DE PREVIEW ===
  const LocalPreviewModal = ({ doc, onClose }) => {
    const isImage = doc.file.type.startsWith("image/");

    // Se por acaso não tiver URL (segurança), não crasha a tela
    if (!doc.previewUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4"
            onClick={onClose}
        >
          <div
              className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-gray-800 font-bold text-lg truncate max-w-md">{doc.file.name}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            {isImage ? "Visualização de Imagem" : "Visualização de PDF"}
                        </span>
              </div>
              <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 p-2 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Corpo do Preview */}
            <div className="flex-1 bg-gray-100 relative w-full h-full overflow-hidden flex items-center justify-center">
              {isImage ? (
                  <img
                      src={doc.previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain p-2"
                  />
              ) : (
                  // EMBED COM CLASSE W-FULL H-FULL É O SEGREDO
                  <embed
                      src={doc.previewUrl}
                      type="application/pdf"
                      className="w-full h-full block"
                  />
              )}
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="min-h-screen bg-white font-sans text-gray-900 px-4 py-6 md:px-10 max-w-6xl mx-auto">
        <PageHeader title="Upload Inteligente" subtitle="Arraste arquivos e use a IA para classificar." />

        {isLoadingData && (
            <div className="fixed inset-0 bg-white/60 z-40 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <FiLoader className="animate-spin text-cyan-600 text-3xl mb-2"/>
                <span className="text-gray-500 font-medium">Carregando informações...</span>
              </div>
            </div>
        )}

        <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold mb-1.5 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <FiLayers className="text-[#00bdd6] w-4 h-4" />
              Setor de Destino
            </label>
            <div className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium cursor-not-allowed flex items-center justify-between">
              <span className="truncate">{currentSector ? currentSector.name : "Carregando..."}</span>
              <FiCheckCircle className="text-gray-400 shrink-0 w-5 h-5" />
            </div>
          </div>

          <Select
              label="Categoria (Aplicar para todos)"
              icon={FiTag}
              value={globalCategoryId}
              onChange={handleGlobalCategoryChange}
              helpText="Selecionar aqui aplicará a categoria a todos os arquivos abaixo."
          >
            <option value="">-- Seleção Individual --</option>
            {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </section>

        <section className="mb-6">

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FiUploadCloud className="text-gray-400"/> Área de Upload
            </span>
            <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#00bdd6] bg-cyan-50 hover:bg-cyan-100 px-3 py-2 rounded-lg transition-colors border border-cyan-100 shadow-sm"
                title="Escanear documento físico"
            >
                <FiPrinter size={16} />
                Digitalizar Documento
            </button>
          </div>

          <FileDropzone selectedFiles={[]} onFilesSelected={handleFiles} isDragging={isDragging} setIsDragging={setIsDragging} maxSizeMB={MAX_FILE_SIZE_MB} />

          <div className="mt-4 flex items-center gap-2">
            <input id="useBatch" type="checkbox" checked={useBatch} onChange={(e) => setUseBatch(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded" />
            <label htmlFor="useBatch" className="text-sm font-medium cursor-pointer">Vincular a um Lote</label>
          </div>

          {useBatch && (
              <div className="mt-3 p-4 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="relative">
                  <input type="text" placeholder="Código (Ex: LOTE-A)" value={batchCode} onChange={e => setBatchCode(e.target.value)} onBlur={handleBatchCodeBlur} className="border p-2 rounded text-sm w-full pr-8" />
                  <div className="absolute right-2 top-2.5">
                    {isCheckingBatch ? <FiLoader className="animate-spin text-cyan-600"/> : batchExists ? <FiCheckCircle className="text-green-500"/> : batchCode && <FiInfo className="text-blue-400"/>}
                  </div>
                </div>
                <input
                    type="text"
                    placeholder={!batchCode ? "Digite o código primeiro..." : batchExists ? "Lote existente (descrição carregada)" : "Descrição para o novo lote..."}
                    value={batchDescription}
                    onChange={e => setBatchDescription(e.target.value)}
                    disabled={batchExists || isCheckingBatch || !batchCode}
                    className={`col-span-2 border p-2 rounded text-sm w-full ${batchExists ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}
                />
              </div>
          )}
        </section>

        {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-sm font-bold text-gray-600">{selectedFiles.length} arquivos na lista</span>
              <div className="flex gap-3">
                <Button
                    onClick={handleAutoCategorizeAll}
                    disabled={isAnalyzingAll || isUploading}
                    className="bg-[#00bdd6] hover:bg-[#00a8be] text-white px-4 py-1.5 text-xs flex gap-2"
                >
                  {isAnalyzingAll ? <FiLoader className="animate-spin" /> : <FiCpu />} Categorização Automática (Todos)
                </Button>
                <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-gray-400 hover:text-gray-600 hover:underline px-2"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>
        )}

        <div className="space-y-3 mb-24">
          {selectedFiles.map((item, index) => (
              <div key={item.id} className={`flex flex-col md:flex-row items-center gap-4 p-3 border rounded-xl bg-white shadow-sm transition-all ${!item.categoryId ? 'border-gray-300' : 'border-gray-200'}`}>

                <div className="flex items-center gap-3 flex-1 overflow-hidden w-full cursor-pointer" onClick={() => setPreviewDoc(item)}>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 text-cyan-600">
                    {item.file.type.includes('image') ? <FiTag /> : <FiFileText />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-700 truncate">{item.file.name}</p>
                    <p className="text-xs text-gray-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex items-center gap-2">
                  {item.isAnalyzing ? (
                      <div className="w-48 flex items-center justify-center gap-2 text-xs text-cyan-600 font-medium animate-pulse bg-cyan-50 h-9 rounded border border-cyan-100">
                        <FiCpu /> Analisando...
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAnalyzeSingle(item.id)}
                            className="h-9 w-9 flex items-center justify-center rounded border border-cyan-200 text-cyan-600 hover:bg-cyan-50 transition-colors"
                            title="Sugerir categoria para este arquivo"
                        >
                          <FiZap size={16} />
                        </button>

                        <div className="w-48">
                          <label htmlFor={`category-select-${item.id}`} className="sr-only">Categoria</label>
                          <select
                              id={`category-select-${item.id}`}
                              name={`category-${index}`}
                              className={`w-full text-sm border rounded h-9 px-2 focus:ring-2 outline-none ${!item.categoryId ? 'border-gray-400 text-gray-500' : 'border-gray-300 text-gray-800'}`}
                              value={item.categoryId || ""}
                              onChange={(e) => updateFileCategory(item.id, e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            {categoriesList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                        </div>
                      </div>
                  )}
                </div>

                <div className="flex gap-2 border-l pl-3 ml-1 border-gray-100">
                  <button onClick={() => setPreviewDoc(item)} className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg" title="Visualizar" type="button"><FiEye /></button>
                  <button onClick={() => removeFile(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Remover" type="button"><FiTrash2 /></button>
                </div>
              </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex items-center justify-between z-40 md:px-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex items-center">
            {feedback.message && (
                <span className={`text-sm font-medium flex items-center ${feedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                     <FiAlertCircle className="mr-2" /> {feedback.message}
                 </span>
            )}
          </div>
          {/* BOTÃO AGORA VALIDA O LOTE (isBatchInvalid) */}
          <Button
              onClick={handleFinalUpload}
              disabled={isUploading || selectedFiles.length === 0 || isBatchInvalid}
              className="bg-[#00bdd6] px-8"
          >
            {isUploading ? `Enviando ${uploadProgress.current}/${uploadProgress.total}...` : 'Confirmar Envio'}
          </Button>
        </div>

        {previewDoc && <LocalPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
          <ScannerModal 
            isOpen={isScannerOpen} 
            onClose={() => setIsScannerOpen(false)} 
            onScanComplete={handleScanComplete}
        />
      </div>
  );
}