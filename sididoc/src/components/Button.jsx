import React from 'react';

export function Button({ children, isLoading, className = "", ...props }) {
  return (
    <button 
      className={`h-12 md:h-11 px-6 rounded-lg flex items-center justify-center gap-2 font-bold text-base md:text-sm text-white bg-[#00bdd6] shadow-sm border border-transparent transition-all duration-200 active:scale-[0.98] hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 whitespace-nowrap ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}