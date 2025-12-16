import { FiChevronDown } from 'react-icons/fi';

export function Select({ label, icon: Icon, value, onChange, options = [], children, error, disabled, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-gray-700 font-bold mb-1.5 text-xs uppercase tracking-wide flex items-center gap-1.5">
          {Icon && <Icon className="text-[#00bdd6]" />} 
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={`
            w-full h-11 pl-4 pr-10
            bg-white text-gray-900 text-sm
            border border-gray-300 rounded-lg
            appearance-none outline-none transition-all cursor-pointer
            focus:border-[#00bdd6] focus:ring-2 focus:ring-[#00bdd6]/20
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {children ? children : options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        {/* Ícone de seta centralizado absolutamente */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <FiChevronDown size={18} />
        </div>
      </div>

      {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
    </div>
  );
}