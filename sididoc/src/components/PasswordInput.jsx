import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export function PasswordInput({ label, value, onChange, placeholder }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        {/* Ícone de Cadeado (Esquerda) */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <FiLock className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          className="w-full h-12 md:h-11 pl-10 pr-10 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-base md:text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        {/* Botão de Olho (Direita) */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-600 active:text-cyan-700 cursor-pointer transition-colors"
          tabIndex="-1"
          title={showPassword ? "Ocultar senha" : "Ver senha"}
        >
          {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}