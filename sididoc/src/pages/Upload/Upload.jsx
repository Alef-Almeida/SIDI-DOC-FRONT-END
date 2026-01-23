import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiUploadCloud,
  FiLayers,
  FiTag,
  FiCheckCircle,
  FiPackage,
  FiLoader,
  FiInfo
} from "react-icons/fi";

// Serviços
import { getAllCategories } from "../../services/adminService";
import { getMySectors } from "../../services/authService";
import { uploadDocument } from "../../services/documentService";
import { findBatchByCode, createBatch } from "../../services/batchService";

// Componentes
import { PageHeader } from "../../components/PageHeader";
import { Select } from "../../components/Select";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { FileDropzone } from "../../components/FileDropzone";

export default function Upload() {
  const location = useLocation();

  // Estados de Dados Principais
  const [currentSector, setCurrentSector] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Estados de UI/Controle
  const [errors, setErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // === ESTADOS PARA O LOTE (BATCH) ===
  const [useBatch, setUseBatch] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [batchDescription, setBatchDescription] = useState("");
  const [isCheckingBatch, setIsCheckingBatch] = useState(false);
  const [batchExists, setBatchExists] = useState(false);

  const MAX_FILE_SIZE_MB = 50;

  // Limpa os dados do lote se o usuário desmarcar a checkbox
  useEffect(() => {
    if (!useBatch) {
      setBatchCode("");
      setBatchDescription("");
      setBatchExists(false);
    }
  }, [useBatch]);

  function getSectorIdFromToken() {
    try {
      const token = localStorage.getItem("sidi_token");
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.sectorId || payload.sector_id || payload.sector;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    async function loadInitialData() {
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
            const activeSector = activeId
                ? mySectors.find(s => s.id === Number(activeId))
                : mySectors[0];
            setCurrentSector(activeSector || mySectors[0]);
          }
        }
      } catch (error) {
        setErrors(["Não foi possível carregar as informações necessárias."]);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadInitialData();
  }, [location.state]);

  // === LÓGICA DE LOTE (BATCH) ===

  async function handleBatchCodeBlur() {
    if (!batchCode.trim()) {
      setBatchExists(false);
      setBatchDescription("");
      return;
    }

    setIsCheckingBatch(true);

    try {
      const foundBatch = await findBatchByCode(batchCode.trim());

      // CENÁRIO 1: ENCONTROU
      if (foundBatch) {
        setBatchExists(true);
        const desc = foundBatch.description ? foundBatch.description : "Lote sem descrição";
        setBatchDescription(desc);
      }

    } catch (error) {
      // CENÁRIO 2: NÃO ENCONTROU (Assume Novo)
      console.log("Lote novo (permitir criação):", error);
      setBatchExists(false);
      setBatchDescription("");
    } finally {
      setIsCheckingBatch(false);
    }
  }

  function handleBatchCodeChange(e) {
    setBatchCode(e.target.value);
    if (batchExists) {
      setBatchExists(false);
      setBatchDescription("");
    }
  }

  function validateFiles(fileList) {
    const valid = [];
    const newErrors = [];
    Array.from(fileList).forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) {
        newErrors.push(`O arquivo "${file.name}" não é um PDF ou Imagem válida.`);
        return;
      }
      if (sizeMB > MAX_FILE_SIZE_MB) {
        newErrors.push(`O arquivo "${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      valid.push({ file, previewUrl: isImage ? URL.createObjectURL(file) : null });
    });
    setErrors(newErrors);
    return valid;
  }

  function handleFiles(fileList) {
    const valid = validateFiles(fileList);
    setSelectedFiles(valid);
    setUploadSuccess(false);
  }

  async function handleUpload() {
    const newErrors = [];

    // 1. Validações Básicas
    if (!currentSector) newErrors.push("Erro: Setor não identificado.");
    if (!selectedCategoryId) newErrors.push("Selecione uma categoria.");
    if (selectedFiles.length === 0) newErrors.push("Selecione um arquivo.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoadingData(true);
    setErrors([]);
    setUploadSuccess(false);

    try {
      // 3. SE TEM LOTE E É NOVO, CRIA PRIMEIRO
      if (useBatch && batchCode.trim() && !batchExists) {
        try {
          await createBatch(batchCode.trim(), batchDescription.trim());
        } catch (batchErr) {
          throw new Error("Falha ao criar o novo lote. Verifique se o código já existe ou tente novamente.");
        }
      }

      // 4. Prepara Upload do Documento
      const formData = new FormData();
      formData.append("file", selectedFiles[0].file);
      formData.append("categoryId", selectedCategoryId);

      if (useBatch && batchCode.trim()) {
        formData.append("batchCode", batchCode.trim());
      }

      await uploadDocument(formData);

      setUploadSuccess(true);
      setSelectedFiles([]);
      setSelectedCategoryId("");

    } catch (error) {
      console.error("Erro upload:", error);
      const msg = error.response?.data?.message || error.message || "Erro ao enviar arquivo.";
      setErrors([msg]);
    } finally {
      setIsLoadingData(false);
    }
  }

  // === LÓGICA DE VALIDAÇÃO DO BOTÃO ===
  // Se o checkbox estiver marcado, o lote é considerado inválido/incompleto se:
  // 1. O código estiver vazio
  // 2. OU (O lote é novo E a descrição está vazia)
  const isBatchInvalid = useBatch && (
      !batchCode.trim() ||
      (!batchExists && !batchDescription.trim())
  );

  return (
      <div className="min-h-screen bg-white font-sans text-gray-900 px-4 py-6 md:px-10 md:py-8 pb-24 md:pb-10 max-w-5xl mx-auto">
        <PageHeader
            title="Upload de Documentos"
            subtitle="Preencha os dados abaixo para digitalizar e arquivar o documento."
        />

        {isLoadingData && !uploadSuccess && (
            <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <FiLoader className="w-10 h-10 text-cyan-500 animate-spin mb-2" />
                <span className="text-gray-600 font-medium">Processando...</span>
              </div>
            </div>
        )}

        {/* Formulários Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">

          {/* 1. Setor */}
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold mb-1.5 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <FiLayers className="text-[#00bdd6] w-4 h-4" />
              Setor de Destino
            </label>
            <div className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium cursor-not-allowed flex items-center justify-between">
            <span className="truncate">
              {currentSector ? currentSector.name : "Carregando..."}
            </span>
              <FiCheckCircle className="text-gray-400 shrink-0 w-5 h-5" />
            </div>
          </div>

          {/* 2. Categoria */}
          <Select
              label="Categoria"
              icon={FiTag}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
            ))}
          </Select>
        </section>

        {/* --- CHECKBOX LOTE --- */}
        <div className="mb-4 flex items-center gap-2">
          <input
              id="useBatch"
              type="checkbox"
              checked={useBatch}
              onChange={(e) => setUseBatch(e.target.checked)}
              className="w-4 h-4 text-[#00bdd6] border-gray-300 rounded focus:ring-[#00bdd6]"
          />
          <label htmlFor="useBatch" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Desejo vincular a um lote de documentos
          </label>
        </div>

        {/* --- SEÇÃO DE LOTE (CONDICIONAL) --- */}
        {useBatch && (
            <section className="mb-6 p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-300 transition-colors shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-cyan-50 p-1.5 rounded-md">
                  <FiPackage className="text-[#00bdd6] w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Associação de Lote
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campo Código */}
                <div className="md:col-span-1">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Código do Lote</label>
                  <div className="relative">
                    <input
                        type="text"
                        value={batchCode}
                        onChange={handleBatchCodeChange}
                        onBlur={handleBatchCodeBlur}
                        placeholder="Ex: LOTE-2026-A"
                        className="w-full h-10 pl-3 pr-8 rounded-lg border border-gray-300 focus:border-[#00bdd6] focus:ring-1 focus:ring-[#00bdd6] text-sm transition-all"
                    />
                    <div className="absolute right-3 top-3">
                      {isCheckingBatch ? (
                          <FiLoader className="animate-spin text-[#00bdd6]" />
                      ) : batchExists ? (
                          <FiCheckCircle className="text-gray-400" title="Lote existente" />
                      ) : batchCode.trim() && !isCheckingBatch ? (
                          <FiInfo className="text-blue-400" title="Novo lote será criado" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Campo Descrição */}
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">
                    Descrição do Lote
                  </label>
                  <input
                      type="text"
                      value={batchDescription}
                      onChange={(e) => setBatchDescription(e.target.value)}
                      disabled={!batchCode.trim() || batchExists || isCheckingBatch}
                      placeholder={
                        !batchCode.trim()
                            ? "Digite o código primeiro..."
                            : batchExists
                                ? ""
                                : "Descrição para o novo lote..."
                      }
                      className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                          (!batchCode.trim() || batchExists || isCheckingBatch)
                              ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed italic"
                              : "bg-white border-gray-300 focus:border-[#00bdd6] focus:ring-1 focus:ring-[#00bdd6]"
                      }`}
                  />
                </div>
              </div>
            </section>
        )}

        {/* Feedback de Erro/Sucesso Global */}
        {errors.length > 0 && (
            <div className="mb-6 animate-shake">
              <Alert type="error" message={errors.join(" ")} />
            </div>
        )}

        {uploadSuccess && (
            <div className="mb-6 animate-fadeIn">
              <Alert
                  type="success"
                  message={`Arquivo enviado com sucesso para ${currentSector?.name}!`}
              />
            </div>
        )}

        {/* Dropzone */}
        <section className="mb-6 md:mb-8">
          <FileDropzone
              selectedFiles={selectedFiles}
              onFilesSelected={handleFiles}
              onClear={() => {
                setSelectedFiles([]);
                setUploadSuccess(false);
              }}
              isDragging={isDragging}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              maxSizeMB={MAX_FILE_SIZE_MB}
          />
        </section>

        {/* Botão de Envio */}
        <div className="flex justify-center md:justify-end">
          <Button
              onClick={handleUpload}
              className="w-full md:w-auto md:px-10 bg-[#00bdd6] hover:bg-[#009eb8]"
              // ALTERADO AQUI PARA A LÓGICA PEDIDA
              disabled={
                  selectedFiles.length === 0 ||
                  !currentSector ||
                  !selectedCategoryId ||
                  isLoadingData ||
                  isCheckingBatch ||
                  isBatchInvalid // <--- Se checkbox marcado e campos vazios/inválidos, bloqueia.
              }
          >
            {isLoadingData ? (
                "Processando..."
            ) : (
                <>
                  <FiUploadCloud className="mr-2 w-5 h-5" />
                  Enviar Documento
                </>
            )}
          </Button>
        </div>
      </div>
  );
}