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
          <FiLock />
        </div>

        {/* Input */}
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        {/* Botão de Olho (Direita) */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-600 cursor-pointer transition"
          tabIndex="-1" // Impede que o TAB foque no olho antes de digitar
          title={showPassword ? "Ocultar senha" : "Ver senha"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
}