import React, { useState } from 'react';
import { FiTrash2, FiUserPlus } from 'react-icons/fi';
import { Select } from './Select';
import { Button } from './Button';

export function SectorCard({ sector, users, onAddUser, onDelete }) {
  // O estado agora é LOCAL. Cada card tem o seu.
  const [selectedEmail, setSelectedEmail] = useState("");

  const handleAddClick = () => {
    if (!selectedEmail) return alert("Selecione um usuário primeiro.");
    // Passa o email selecionado e o código do setor para o pai
    onAddUser(selectedEmail, sector.code);
    // Limpa a seleção após adicionar
    setSelectedEmail(""); 
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 text-base">{sector.name}</h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold">
              {sector.code}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em]">
            {sector.description || "Sem descrição definida."}
          </p>
        </div>
        
        <button 
          onClick={() => onDelete(sector.id)} 
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
          title="Excluir setor"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {/* Rodapé do Card (Adicionar Membro) */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Membros
            </p>
            <span className="bg-cyan-50 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {sector.membersCount || 0}
            </span>
        </div>

        <div className="flex gap-2 items-center">
          {/* O Select agora controla apenas o selectedEmail DESTE componente */}
          <div className="flex-1">
            <Select 
              value={selectedEmail} 
              onChange={e => setSelectedEmail(e.target.value)}
              className="text-xs py-2" // Ajuste fino de estilo se necessário
            >
              <option value="">+ Add membro...</option>
              {users.map(u => (
                <option key={u.id} value={u.email}>{u.name}</option>
              ))}
            </Select>
          </div>

          <div className="w-10">
            <Button 
                onClick={handleAddClick} 
                className="px-0 py-2.5 rounded-xl bg-[#00bdd6] hover:bg-[#009eb8]"
            >
              <FiUserPlus size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}