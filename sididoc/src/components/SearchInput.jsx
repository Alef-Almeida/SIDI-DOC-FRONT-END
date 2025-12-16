import { FiSearch } from 'react-icons/fi';

export function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm w-64 bg-white"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}