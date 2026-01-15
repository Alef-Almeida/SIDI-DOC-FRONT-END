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
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 md:p-10 text-center transition-all duration-200 ease-in-out ${isDragging ? "border-[#00bdd6] bg-[#e0faff]" : "border-gray-300 bg-[#f9fbfd] hover:bg-gray-50"}`}
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
        <div className="relative inline-block w-full max-w-[240px] animate-fadeInScale">
           <div className="flex h-32 md:h-40 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-2 text-gray-600 px-4">
                 <FiFileText className="text-red-500 w-8 h-8 md:w-10 md:h-10" />
                 <span className="font-semibold text-xs md:text-sm truncate w-full max-w-[180px]">
                   {selectedFiles[0].file.name}
                 </span>
              </div>
           </div>
           
           <button 
             onClick={onClear} 
             className="absolute -right-2 -top-2 md:-right-3 md:-top-3 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md border border-gray-100 hover:text-red-600 active:scale-95 transition"
           >
             <FiX size={16} />
           </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-3 md:mb-4 bg-cyan-50 p-3 md:p-4 rounded-full text-[#00bdd6]">
            <FiUploadCloud className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          
          <p className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
            Toque ou arraste o arquivo
          </p>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            ou clique para selecionar
          </p>
          
          <button
            onClick={openFileDialog}
            className="px-6 py-3 md:py-2.5 rounded-full bg-[#00bdd6] text-white text-sm font-semibold hover:bg-[#009eb8] active:scale-95 transition shadow-sm w-full md:w-auto"
          >
            Buscar Arquivo
          </button>
          
          <p className="mt-4 md:mt-6 text-[10px] md:text-xs text-gray-400">
            Suporta: PDF, JPG, PNG (máx. {maxSizeMB} MB)
          </p>
        </div>
      )}
    </div>
  );
}