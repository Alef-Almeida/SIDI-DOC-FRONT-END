import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  FiArrowLeft,
  FiFileText,
  FiUploadCloud,
  FiX,
  FiChevronDown,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function Upload() {
  // ============================================================
  // ESTADOS
  // ============================================================
  const [setor, setSetor] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("pdf");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE_MB = 50;

  // ============================================================
  // FUNÇÕES AUXILIARES
  // ============================================================
  function openFileDialog() {
    fileInputRef.current?.click();
  }

  function validateFiles(fileList) {
    const valid = [];
    const newErrors = [];

    Array.from(fileList).forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        newErrors.push(`Arquivo "${file.name}" não é PDF ou imagem.`);
        return;
      }

      if (sizeMB > MAX_FILE_SIZE_MB) {
        newErrors.push(`Arquivo "${file.name}" excede 50MB.`);
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

  function handleFiles(files) {
    const valid = validateFiles(files);
    setSelectedFiles(valid);
    setUploadSuccess(false);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  function handleFileChange(e) {
    if (e.target.files) handleFiles(e.target.files);
  }

  function clearFile() {
    setSelectedFiles([]);
    setErrors([]);
    setUploadSuccess(false);
  }

  // ============================================================
  // UPLOAD REAL
  // ============================================================
  async function handleUpload() {
    const newErrors = [];

    if (!setor) newErrors.push("Selecione um setor.");
    if (!tipoDocumento) newErrors.push("Selecione o tipo de documento.");
    if (selectedFiles.length === 0) newErrors.push("Selecione pelo menos um arquivo.");

    // valida tipo escolhido x tipo real
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0].file;
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (tipoDocumento === "pdf" && !isPdf) {
        newErrors.push("Você selecionou 'PDF', mas o arquivo enviado não é PDF.");
      }

      if (tipoDocumento === "imagem" && !isImage) {
        newErrors.push("Você selecionou 'Imagem (JPG/PNG)', mas o arquivo enviado não é imagem.");
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setUploadSuccess(false);
      return;
    }

    // pega token salvo no login
    const token = localStorage.getItem("sidi_token");
    if (!token) {
      setErrors(["Você precisa estar logada para fazer upload. Faça login novamente."]);
      setUploadSuccess(false);
      return;
    }

    try {
      setIsUploading(true);
      setErrors([]);
      setUploadSuccess(false);

      const formData = new FormData();
      formData.append("file", selectedFiles[0].file);

      // Se o backend NÃO espera setor/tipo, deixe comentado.
      // Se no futuro ele aceitar, basta descomentar:
      // formData.append("setor", setor);
      // formData.append("tipo", tipoDocumento);

      const response = await api.post("/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO setar Content-Type manualmente aqui!
        },
      });

      console.log("Upload OK:", response.data);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);

      let msg = "Erro ao enviar arquivo. Tente novamente.";

      if (error.response) {
        // backend respondeu com erro HTTP
        if (error.response.status === 401) msg = "Não autorizado. Faça login novamente.";
        else if (error.response.data?.message) msg = error.response.data.message;
        else if (error.response.data?.error) msg = error.response.data.error;
        else msg = `Erro HTTP ${error.response.status}`;
      } else if (error.code === "ERR_NETWORK") {
        msg = "Erro de rede: confirme se o BACK está rodando em http://localhost:8080";
      }

      setErrors([msg]);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  }

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <header className="flex items-center gap-4 px-6 md:px-20 h-14 border-b border-gray-200 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <FiArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#00bdd6] flex items-center justify-center text-white shadow-sm">
            <FiFileText size={22} />
          </div>
          <span className="font-bold text-lg tracking-tight">SIDI-DOC</span>
        </div>
      </header>

      <main className="px-6 md:px-20 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Upload de Documentos</h1>
          <p className="text-sm text-gray-500">Envie seus documentos para digitalização automática.</p>
        </header>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4 max-w-4xl">
          <div className="flex flex-col">
            <label className="text-[13px] font-semibold mb-1.5 text-gray-900">Setor</label>
            <div className="relative">
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full py-3 pl-4 pr-10 rounded-full border border-gray-200 bg-white text-sm text-gray-900 appearance-none outline-none focus:border-[#00bdd6] focus:ring-2 focus:ring-[#00bdd6]/15 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <option value="">Selecione um setor...</option>
                <option value="administrativo">Administrativo</option>
                <option value="financeiro">Financeiro</option>
                <option value="educacao">Educação</option>
                <option value="saude">Saúde</option>
                <option value="outros">Outros</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[13px] font-semibold mb-1.5 text-gray-900">Tipo de Documento</label>
            <div className="relative">
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full py-3 pl-4 pr-10 rounded-full border border-gray-200 bg-white text-sm text-gray-900 appearance-none outline-none focus:border-[#00bdd6] focus:ring-2 focus:ring-[#00bdd6]/15 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <option value="pdf">PDF</option>
                <option value="imagem">Imagem (JPG/PNG)</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </section>

        {errors.length > 0 && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex flex-col gap-1">
            {errors.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <FiAlertCircle size={16} className="shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <FiCheckCircle size={16} />
            <span>Arquivo enviado com sucesso!</span>
          </div>
        )}

        <section className="mt-7">
          <div
            className={`relative overflow-hidden rounded-[18px] border-2 border-dashed p-12 text-center transition-all duration-200 ease-in-out ${
              isDragging ? "border-[#00bdd6] bg-[#e0faff]" : "border-gray-300 bg-[#f9fbfd]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 ? (
              <div className="relative inline-block">
                {selectedFiles[0].previewUrl ? (
                  <img
                    src={selectedFiles[0].previewUrl}
                    alt="preview"
                    className="w-60 max-w-full rounded-2xl border border-gray-200 opacity-40 blur-[2px]"
                  />
                ) : (
                  <div className="flex h-40 w-60 items-center justify-center rounded-2xl border border-gray-200 bg-white opacity-70">
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <FiFileText size={40} />
                      <span className="font-semibold">PDF Selecionado</span>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="px-4 text-center text-sm font-bold text-gray-800 drop-shadow-md bg-white/50 py-1 rounded">
                    {selectedFiles[0].file.name}
                  </p>
                </div>

                <button
                  onClick={clearFile}
                  className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900 shadow-md transition-colors hover:bg-red-50 hover:text-red-600 border border-gray-100 cursor-pointer"
                  title="Remover arquivo"
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-3">
                  <FiUploadCloud size={40} className="text-[#00bdd6]" />
                </div>

                <p className="text-base font-semibold text-gray-900">Arraste seus arquivos aqui</p>
                <p className="my-2.5 text-[13px] text-gray-500">ou</p>

                <button
                  onClick={openFileDialog}
                  className="px-6 py-2.5 rounded-full bg-[#00bdd6] text-white text-sm font-semibold transition-colors hover:bg-[#009eb8] cursor-pointer"
                >
                  Selecionar Arquivos
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Formatos aceitos: PDF, JPG, PNG (máx. {MAX_FILE_SIZE_MB} MB)
                </p>
              </>
            )}
          </div>
        </section>

        <div className="mt-7">
          <button
            onClick={handleUpload}
            className="px-8 py-3.5 rounded-full bg-[#00bdd6] text-white text-base font-semibold transition-transform hover:bg-[#009eb8] active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? "Enviando..." : "Enviar documentos"}
          </button>
        </div>
      </main>
    </div>
  );
}
