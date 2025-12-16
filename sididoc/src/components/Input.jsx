import React from 'react';

export function Input({ label, icon: Icon, rightElement, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-700 font-bold mb-1.5 text-xs uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input 
          className={`
            w-full h-11 /* Altura Fixa para alinhar com Select e Button */
            ${Icon ? 'pl-10' : 'pl-4'} 
            ${rightElement ? 'pr-10' : 'pr-4'}
            bg-white text-gray-900 text-sm
            border border-gray-300 rounded-lg
            outline-none transition-all
            placeholder:text-gray-400
            focus:border-[#00bdd6] focus:ring-2 focus:ring-[#00bdd6]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props} 
        />
        
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && <span className="text-xs text-red-500 mt-1 font-medium">{error}</span>}
    </div>
  );
}