import React from 'react';
import { FiLogOut } from 'react-icons/fi';

export function Sidebar({ title = "SIDI ADMIN", menuItems, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 flex flex-row items-center justify-between px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-t-0 md:p-6 md:justify-between md:shadow-none">
      
      <div className="contents md:block w-full">
        <h1 className="hidden md:block text-2xl font-extrabold text-cyan-600 mb-8 tracking-tight">
          {title}
        </h1>
        
        <nav className="flex flex-1 justify-around w-full md:block md:space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex items-center transition-all duration-200 flex-col justify-center p-1 gap-0.5 rounded-lg text-[10px] w-full md:flex-row md:text-sm md:px-4 md:py-3 md:gap-3 md:justify-start ${activeTab === item.id ? 'text-cyan-600 font-bold md:bg-cyan-50 md:text-cyan-700 md:shadow-sm' : 'text-gray-500 hover:text-cyan-500 md:hover:bg-gray-50 md:text-gray-600'}`}
            >
              <item.icon className={`w-6 h-6 md:w-5 md:h-5 ${activeTab === item.id ? '-translate-y-0.5 md:translate-y-0' : ''} transition-transform`} /> 
              
              <span className="truncate max-w-[64px] md:max-w-none">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <button 
        onClick={onLogout} 
        className="flex items-center justify-center p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0 border-l border-gray-100 ml-1 pl-3 md:w-full md:gap-2 md:text-sm md:font-bold md:mt-8 md:justify-start md:border-0 md:ml-0 md:pl-0"
        title="Sair"
      >
        <FiLogOut className="w-5 h-5 md:w-4 md:h-4" /> 
        <span className="hidden md:inline">Sair</span>
      </button>
    </aside>
  );
}