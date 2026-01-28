// src/components/ScannerModal.jsx
import React, { useState } from 'react';
import { FiPrinter, FiX, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiSave } from 'react-icons/fi';
import { ScannerService } from '../services/ScannerService';
import { Button } from './Button'; // Seu componente Button

export function ScannerModal({ isOpen, onClose, onScanComplete }) {
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, PREVIEW
  const [pdfBlob, setPdfBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleScan = async () => {
    setStatus('SCANNING');
    setErrorMsg('');
    try {
      const blob = await ScannerService.scanDocument();
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPreviewUrl(url);
      setStatus('PREVIEW');
    } catch (error) {
      setErrorMsg("Não foi possível conectar ao Scanner. Verifique se o agente 'iniciar_scanner.bat' está rodando.");
      setStatus('IDLE');
    }
  };

  const handleConfirm = () => {
    // Apenas passa o arquivo para o componente Pai (Upload.jsx)
    // O Pai decide se envia agora ou adiciona na lista junto com outros
    if (pdfBlob) {
      // Converte Blob para File object compatível com o resto do sistema
      const file = new File([pdfBlob], `digitalizacao_${new Date().toLocaleTimeString().replace(/:/g,'-')}.pdf`, { type: "application/pdf" });
      onScanComplete(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4">
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header (Igual ao seu LocalPreviewModal) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
              <FiPrinter className="text-[#00bdd6]" /> Digitalizar Documento
            </h3>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
               Módulo de Captura
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 p-2 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 bg-gray-100 relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-6">
          
          {status === 'IDLE' && (
            <div className="text-center max-w-md">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
                <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-[#00bdd6] mb-4">
                   <FiPrinter size={40} />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Pronto para digitalizar</h4>
                <p className="text-gray-500 mb-6 text-sm">
                  Coloque o documento no scanner e certifique-se que o Agente Local está rodando.
                </p>
                
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2 text-left">
                        <FiAlertCircle className="shrink-0 w-5 h-5"/> {errorMsg}
                    </div>
                )}

                <Button onClick={handleScan} className="w-full">
                  Iniciar Digitalização
                </Button>
              </div>
            </div>
          )}

          {status === 'SCANNING' && (
            <div className="flex flex-col items-center animate-fadeIn">
               <div className="w-16 h-16 border-4 border-[#00bdd6] border-t-transparent rounded-full animate-spin mb-6"></div>
               <h4 className="text-lg font-bold text-gray-700">Digitalizando...</h4>
               <p className="text-gray-400 text-sm">Aguardando resposta do hardware.</p>
            </div>
          )}

          {status === 'PREVIEW' && previewUrl && (
            <div className="w-full h-full flex flex-col gap-4 animate-fadeIn">
                <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 overflow-hidden relative">
                    <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
                </div>
                <div className="flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={handleScan}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                        <FiRefreshCw /> Tentar Novamente
                    </button>
                    <Button onClick={handleConfirm} className="px-8">
                        <FiCheckCircle className="mr-2"/> Usar este Arquivo
                    </Button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}