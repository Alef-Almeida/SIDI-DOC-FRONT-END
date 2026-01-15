import React from 'react';
import { FiSearch } from 'react-icons/fi';

export function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative w-full md:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400 w-5 h-5" />
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full h-11 md:h-10 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-base md:text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}