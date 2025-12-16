import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUploadCloud,
  FiLayers,
  FiTag,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

// Serviços
import { getAllCategories } from "../../services/adminService";
import { getMySectors } from "../../services/authService";
import { uploadDocument } from "../../services/documentService"; // <--- Importe o serviço real

// Componentes
import { PageHeader } from "../../components/PageHeader";
import { Select } from "../../components/Select";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { FileDropzone } from "../../components/FileDropzone";

export default function Upload() {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados
  const [currentSector, setCurrentSector] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const MAX_FILE_SIZE_MB = 50;

  // Carregamento Inicial
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingData(true);
      try {
        // Busca Categorias
        const cats = await getAllCategories();
        setCategoriesList(cats || []);

        // Define Setor (Apenas visualmente agora)
        if (location.state && location.state.sector) {
          setCurrentSector(location.state.sector);
        } else {
          const mySectors = await getMySectors();
          if (mySectors && mySectors.length > 0) setCurrentSector(mySectors[0]);
        }
      } catch (error) {
        setErrors(["Não foi possível carregar as informações necessárias."]);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadInitialData();
  }, [location.state]);

  // Manipulação de Arquivos
  function validateFiles(fileList) {
    const valid = [];
    const newErrors = [];

    Array.from(fileList).forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        newErrors.push(
          `O arquivo "${file.name}" não é um PDF ou Imagem válida.`
        );
        return;
      }

      if (sizeMB > MAX_FILE_SIZE_MB) {
        newErrors.push(
          `O arquivo "${file.name}" excede o limite de ${MAX_FILE_SIZE_MB}MB.`
        );
        return;
      }

      valid.push({
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
      });
    });

    setErrors(newErrors);
    return valid;
  }

  function handleFiles(fileList) {
    const valid = validateFiles(fileList);
    setSelectedFiles(valid);
    setUploadSuccess(false);
  }

  // Envio
  async function handleUpload() {
    const newErrors = [];
    
    // 1. Validações
    if (!currentSector) newErrors.push("Erro: Setor não identificado.");
    
    // Verifica se tem ID e se não é a string "Selecione..." ou vazio
    if (!selectedCategoryId || selectedCategoryId === "") {
        newErrors.push("Selecione uma categoria.");
    }
    
    if (selectedFiles.length === 0) newErrors.push("Selecione um arquivo.");

    if (newErrors.length > 0) { 
      setErrors(newErrors); 
      return; 
    }

    try {
      setErrors([]); 
      setUploadSuccess(false);
      setIsLoadingData(true);
      
      const formData = new FormData();
      formData.append("file", selectedFiles[0].file);
      
      // === A MÁGICA ACONTECE AQUI ===
      // 1. Garante que é tratado como número no JS (ex: remove espaços, valida)
      const idNumerico = Number(selectedCategoryId);
      
      if (isNaN(idNumerico)) {
         throw new Error(`ID da categoria inválido: ${selectedCategoryId}`);
      }

      // 2. O FormData exige String, mas tem que ser a String de um número (ex: "5")
      // Se mandar "Memorando", o Java explode. Se mandar "5", o Java converte para Long 5.
      formData.append("categoryId", String(idNumerico)); 

      console.log("Enviando para o Back:", { 
        file: selectedFiles[0].file.name,
        categoryIdEnviado: String(idNumerico) // Deve aparecer um número entre aspas, ex: "1"
      });
      
      // Chamada API
      await uploadDocument(formData);
      
      // Sucesso
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

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 px-6 md:px-20 py-8 pb-20">
      <PageHeader
        title="Upload de Documentos"
        subtitle="Preencha os dados abaixo para digitalizar e arquivar o documento."
      />

      {isLoadingData ? (
        <div className="py-10 text-gray-500 text-center animate-pulse">
          Carregando informações...
        </div>
      ) : (
        <>
          {/* Formulários */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mb-8">
            {/* 1. Setor Read-Only (Apenas informativo) */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-bold mb-1.5 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FiLayers className="text-[#00bdd6]" size={16} />
                Setor de Destino
              </label>
              <div className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium cursor-not-allowed flex items-center justify-between">
                <span className="truncate">
                  {currentSector ? currentSector.name : "Nenhum"}
                </span>
                <FiCheckCircle className="text-gray-400 shrink-0" size={18} />
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

              {/* O ERRO PROVAVELMENTE ESTAVA AQUI: value={c.name} */}
              {categoriesList.map((c) => (
                // CORREÇÃO: value={c.id} (O ID, não o nome!)
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </section>

          {/* Feedback */}
          {errors.length > 0 && (
            <div className="mb-6">
              <Alert type="error" message={errors.join(" ")} />
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-6">
              <Alert
                type="success"
                message={`Arquivo enviado com sucesso para ${currentSector?.name}!`}
              />
            </div>
          )}

          {/* Dropzone */}
          <section>
            <FileDropzone
              selectedFiles={selectedFiles}
              onFilesSelected={handleFiles}
              onClear={() => {
                setSelectedFiles([]);
                setUploadSuccess(false);
              }}
              isDragging={isDragging}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              maxSizeMB={MAX_FILE_SIZE_MB}
            />
          </section>

          {/* Botão */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleUpload}
              className="w-auto px-10 bg-[#00bdd6] hover:bg-[#009eb8]"
              disabled={
                selectedFiles.length === 0 ||
                !currentSector ||
                !selectedCategoryId ||
                isLoadingData // Desabilita se estiver enviando
              }
            >
              {isLoadingData ? (
                "Enviando..."
              ) : (
                <>
                  <FiUploadCloud size={20} className="mr-2" />
                  Enviar Documento
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
