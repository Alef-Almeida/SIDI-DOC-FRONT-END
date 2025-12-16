import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

export function PageHeader({ title, subtitle, showBackButton = true }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {/* Top Bar com Logo e Voltar */}
      <div className="flex items-center gap-4 mb-6">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#00bdd6] flex items-center justify-center text-white shadow-sm">
            <FiFileText size={22} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">SIDI-DOC</span>
        </div>
      </div>

      {/* Título da Página */}
      {title && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}