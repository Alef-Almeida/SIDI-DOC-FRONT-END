// src/pages/UploadPage.jsx
import { useState, useRef } from "react";
import "./UploadPage.css";
import api from "../services/api";

export default function UploadPage() {
  const [setor, setSetor] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("pdf");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE_MB = 50;

  // ============================================================
  // Abrir seletor de arquivos
  // ============================================================
  function openFileDialog() {
    fileInputRef.current?.click();
  }

  // ============================================================
  // Validar arquivos
  // ============================================================
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

  // ============================================================
  // Drag & Drop
  // ============================================================
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

  // ============================================================
  // Input tradicional
  // ============================================================
  function handleFileChange(e) {
    if (e.target.files) handleFiles(e.target.files);
  }

  // ============================================================
  // Limpar arquivo selecionado
  // ============================================================
  function clearFile() {
    setSelectedFiles([]);
    setErrors([]);
    setUploadSuccess(false);
  }

  // ============================================================
  // 📌 handleUpload — versão que você pediu
  // ============================================================
  async function handleUpload() {
    const newErrors = [];

    if (!setor) newErrors.push("Selecione um setor.");
    if (!tipoDocumento) newErrors.push("Selecione o tipo de documento.");
    if (selectedFiles.length === 0) newErrors.push("Selecione pelo menos um arquivo.");

    if (selectedFiles.length > 0) {
      const file = selectedFiles[0].file;

      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (tipoDocumento === "pdf" && !isPdf)
        newErrors.push("Você selecionou 'PDF', mas o arquivo enviado não é PDF.");

      if (tipoDocumento === "imagem" && !isImage)
        newErrors.push("Você selecionou 'Imagem (JPG/PNG)', mas o arquivo enviado não é imagem.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setUploadSuccess(false);
      return;
    }

    try {
      setErrors([]);
      setUploadSuccess(false);

      const formData = new FormData();
      formData.append("file", selectedFiles[0].file);

      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload OK:", response.data);
      setUploadSuccess(true);

    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);

      if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(["Erro ao enviar arquivo. Tente novamente."]);
      }

      setUploadSuccess(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="upload-page">
      {/* HEADER */}
      <header className="topbar">
        <button className="back-button">
          <svg className="back-icon" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="topbar-brand">
          <div className="brand-icon">
            <svg className="brand-icon-svg" viewBox="0 0 24 24">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          </div>
          <span className="brand-text">SIDI-DOC</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="upload-main">
        <header className="upload-header">
          <h1>Upload de Documentos</h1>
          <p>Envie seus documentos para digitalização automática.</p>
        </header>

        {/* FILTROS */}
        <section className="upload-filters">
          <div className="field">
            <label>Setor</label>
            <select value={setor} onChange={(e) => setSetor(e.target.value)}>
              <option value="">Selecione um setor...</option>
              <option value="administrativo">Administrativo</option>
              <option value="financeiro">Financeiro</option>
              <option value="educacao">Educação</option>
              <option value="saude">Saúde</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div className="field">
            <label>Tipo de Documento</label>
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="imagem">Imagem (JPG/PNG)</option>
            </select>
          </div>
        </section>

        {/* ERROS */}
        {errors.length > 0 && (
          <div className="upload-errors">
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}

        {uploadSuccess && (
          <div className="upload-success">Arquivo enviado com sucesso!</div>
        )}

        {/* DROPZONE */}
        <section className="upload-dropzone-wrapper">
          <div
            className={isDragging ? "dropzone dropzone--dragging" : "dropzone"}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* SE TIVER ARQUIVO → mostrar preview com blur + botão de limpar */}
            {selectedFiles.length > 0 ? (
              <div className="preview-area">
                {selectedFiles[0].previewUrl ? (
                  <img
                    src={selectedFiles[0].previewUrl}
                    alt="preview"
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-pdf">PDF selecionado</div>
                )}

                <button className="clear-file-btn" onClick={clearFile}>
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="dropzone-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 16V4" />
                    <path d="M8 8l4-4 4 4" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                </div>

                <p className="dropzone-title">Arraste seus arquivos aqui</p>
                <p className="dropzone-or">ou</p>

                <button className="dropzone-button" onClick={openFileDialog}>
                  Selecionar Arquivos
                </button>

                <p className="dropzone-hint">
                  Formatos aceitos: PDF, JPG, PNG (máx. {MAX_FILE_SIZE_MB} MB)
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              className="dropzone-input-hidden"
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* BOTÃO FINAL */}
        <div className="upload-actions">
          <button className="upload-button" onClick={handleUpload}>
            Enviar documentos
          </button>
        </div>
      </main>
    </div>
  );
}
