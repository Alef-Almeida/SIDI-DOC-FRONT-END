import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function Consult() {
  return (
    <div className="p-4 md:p-10 min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Header Simples */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Página de Consulta</h1>
        <p className="text-gray-500 text-sm mt-1">Aqui ficará a lista completa e filtros.</p>
      </div>

      {/* Placeholder de Conteúdo */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 text-center text-gray-400 text-sm">
        Em construção...
      </div>

      <Link 
        to="/home" 
        className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition active:scale-95 p-2 -ml-2 rounded-lg hover:bg-cyan-50"
      >
        <FiArrowLeft /> Voltar ao Dashboard
      </Link>
    </div>
  );
}