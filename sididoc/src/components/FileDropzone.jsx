import { useRef } from 'react';
import { FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';

export function FileDropzone({ 
  onFilesSelected, 
  selectedFiles, 
  onClear, 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  maxSizeMB 
}) {
  const fileInputRef = useRef(null);

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    if (e.target.files) onFilesSelected(e.target.files);
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ease-in-out
        ${isDragging ? "border-[#00bdd6] bg-[#e0faff]" : "border-gray-300 bg-[#f9fbfd] hover:bg-gray-50"}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        <div className="relative inline-block animate-fadeInScale">
          {/* ... Lógica de Preview do arquivo (Copiar do seu código original) ... */}
           <div className="flex h-40 w-60 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-2 text-gray-600">
                 <FiFileText size={32} className="text-red-500" />
                 <span className="font-semibold text-sm truncate max-w-[150px]">{selectedFiles[0].file.name}</span>
              </div>
           </div>
           
           <button onClick={onClear} className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md border border-gray-100 hover:text-red-600">
             <FiX size={16} />
           </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-4 bg-cyan-50 p-4 rounded-full text-[#00bdd6]">
            <FiUploadCloud size={32} />
          </div>
          <p className="text-lg font-semibold text-gray-800">Arraste e solte o arquivo aqui</p>
          <p className="mt-1 mb-4 text-sm text-gray-500">ou clique para selecionar</p>
          <button
            onClick={openFileDialog}
            className="px-6 py-2.5 rounded-full bg-[#00bdd6] text-white text-sm font-semibold hover:bg-[#009eb8] shadow-sm"
          >
            Buscar Arquivo
          </button>
          <p className="mt-6 text-xs text-gray-400">Suporta: PDF, JPG, PNG (máx. {maxSizeMB} MB)</p>
        </div>
      )}
    </div>
  );
}