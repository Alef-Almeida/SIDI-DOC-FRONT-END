import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-8 gap-4 pb-8">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-gray-600"
      >
        <FiChevronLeft size={20} />
      </button>
      
      <span className="text-sm font-bold text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-gray-600"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}