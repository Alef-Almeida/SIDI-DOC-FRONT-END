import { FiLogOut } from 'react-icons/fi';

export function Sidebar({ title = "SIDI ADMIN", menuItems, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="bg-white w-full md:w-64 border-r border-gray-200 p-6 flex flex-col justify-between shadow-lg sticky top-0 h-screen z-10 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-cyan-600 mb-8 tracking-tight">{title}</h1>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${activeTab === item.id 
                  ? 'bg-cyan-50 text-cyan-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon size={18} /> 
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button 
        onClick={onLogout} 
        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold mt-8"
      >
        <FiLogOut /> Sair
      </button>
    </aside>
  );
}