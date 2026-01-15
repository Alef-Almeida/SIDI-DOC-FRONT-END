import React, { useState } from 'react';
import { FiTrash2, FiUserPlus } from 'react-icons/fi';
import { Select } from './Select';
import { Button } from './Button';

export function SectorCard({ sector, users, onAddUser, onDelete }) {
  const [selectedEmail, setSelectedEmail] = useState("");

  const handleAddClick = () => {
    if (!selectedEmail) return alert("Selecione um usuário primeiro.");
    onAddUser(selectedEmail, sector.code);
    setSelectedEmail(""); 
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md">
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="pr-2">
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <h3 className="font-bold text-gray-800 text-lg md:text-base leading-tight">
              {sector.name}
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border font-mono font-bold shrink-0">
              {sector.code}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">
            {sector.description || "Sem descrição definida."}
          </p>
        </div>
        
        {/* Botão Deletar: Área de toque maior para mobile */}
        <button 
          onClick={() => onDelete(sector.id)} 
          className="text-gray-400 p-2 -mr-2 -mt-2 rounded-lg transition-colors active:bg-red-50 active:text-red-500 hover:text-red-500 hover:bg-red-50"
          title="Excluir setor"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Rodapé do Card (Adicionar Membro) */}
      <div className="mt-2 pt-3 md:pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Membros
            </p>
            <span className="bg-cyan-50 text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {sector.membersCount || 0}
            </span>
        </div>

        <div className="flex gap-2 items-stretch h-11 md:h-10">
          <div className="flex-1">
            <Select 
              value={selectedEmail} 
              onChange={e => setSelectedEmail(e.target.value)}
              className="text-sm h-full"
            >
              <option value="">+ Add membro...</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>{u.name}</option>
              ))}
            </Select>
          </div>

          <div className="w-12 shrink-0">
            <Button 
                onClick={handleAddClick} 
                className="px-0 w-full h-full rounded-lg bg-[#00bdd6] hover:bg-[#009eb8] flex items-center justify-center"
            >
              <FiUserPlus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}