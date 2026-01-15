import React from 'react';
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

export function PageHeader({ title, subtitle, showBackButton = true }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 md:mb-8">
      {/* Top Bar com Logo e Voltar */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer active:scale-95"
            aria-label="Voltar"
          >
            <FiArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#00bdd6] flex items-center justify-center text-white shadow-sm shrink-0">
            <FiFileText className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-gray-900">
            SIDI-DOC
          </span>
        </div>
      </div>

      {/* Título da Página */}
      {title && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}