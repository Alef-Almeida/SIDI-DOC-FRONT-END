import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-6 md:mt-8 gap-4 pb-8">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 md:p-2 border border-gray-200 bg-white rounded-lg text-gray-600 transition-all duration-200 active:scale-95 active:bg-gray-100 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-white disabled:hover:border-gray-200"
        aria-label="Página anterior"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-bold text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 md:p-2 border border-gray-200 bg-white rounded-lg text-gray-600 transition-all duration-200 active:scale-95 active:bg-gray-100 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-white disabled:hover:border-gray-200"
        aria-label="Próxima página"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}