import React from 'react';

export function Button({ children, isLoading, className = "", ...props }) {
  return (
    <button 
      className={`
        h-11 px-6 rounded-lg
        flex items-center justify-center gap-2
        font-bold text-sm text-white
        bg-[#00bdd6] shadow-sm border border-transparent
        transition-all hover:brightness-95 active:scale-[0.98]
        disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
        whitespace-nowrap
        ${className}
      `}
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