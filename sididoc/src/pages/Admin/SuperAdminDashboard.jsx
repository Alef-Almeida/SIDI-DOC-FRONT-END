import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiLayers, FiTag, FiPlus, FiTrash2, FiUserPlus } from 'react-icons/fi';

import { 
  registerUser, getAllUsers, getAllSectors, createSector, deleteSector, addUserToSector,
  getAllCategories, createCategory, disableCategory 
} from '../../services/adminService';

// COMPONENTES
import { Sidebar } from '../../components/Sidebar';
import { SearchInput } from '../../components/SearchInput';
import { Alert } from '../../components/Alert';
import { Select } from '../../components/Select';
import { Pagination } from '../../components/Pagination';
import { TableContainer, TableHeader } from '../../components/TableContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SectorCard } from '../../components/SectorCard';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const ITEMS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);

  const [usersList, setUsersList] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Forms
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'OPERATOR' });
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [newSector, setNewSector] = useState({ name: '', code: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const MENU_ITEMS = [
    { id: 'users', label: 'Usuários', icon: FiUsers },
    { id: 'sectors', label: 'Setores', icon: FiLayers },
    { id: 'categories', label: 'Categorias', icon: FiTag },
  ];

  useEffect(() => {
    loadData();
    setCurrentPage(1);
    setSearchTerm('');
    setMessage({ type: '', text: '' });
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const sectorsData = await getAllSectors();
      setSectorsList(Array.isArray(sectorsData) ? sectorsData : []);

      const usersData = await getAllUsers();
      setUsersList(Array.isArray(usersData) ? usersData : []);
      
      if (activeTab === 'categories') {
        const catsData = await getAllCategories();
        setCategoriesList(Array.isArray(catsData) ? catsData : []);
      }
    } catch (err) {
      console.warn("Erro parcial ao carregar dados.", err);
    } finally {
      setLoading(false);
    }
  }

  const getCurrentList = () => {
    let list = [];
    if (activeTab === 'users') list = usersList;
    if (activeTab === 'sectors') list = sectorsList;
    if (activeTab === 'categories') list = categoriesList;
    if (!Array.isArray(list)) return [];

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        list = list.filter(item => 
            (item.name && item.name.toLowerCase().includes(lowerTerm)) ||
            (item.email && item.email.toLowerCase().includes(lowerTerm)) ||
            (item.code && item.code.toLowerCase().includes(lowerTerm))
        );
    }
    return list;
  };

  const currentListFull = getCurrentList();
  const totalPages = Math.ceil(currentListFull.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = currentListFull.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE
  );

  // === HANDLERS ===
  async function handleRegisterUser(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const sectorArray = selectedSectorId ? [Number(selectedSectorId)] : [];
      await registerUser({ ...newUser, sectorIds: sectorArray });
      setMessage({ type: 'success', text: `Usuário ${newUser.name} cadastrado!` });
      setNewUser({ name: '', email: '', role: 'OPERATOR' });
      setSelectedSectorId('');
      loadData();
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao cadastrar usuário.' }); }
  }

  async function handleCreateSector(e) {
    e.preventDefault();
    try {
      await createSector(newSector);
      setNewSector({ name: '', code: '', description: '' });
      loadData();
      setMessage({ type: 'success', text: 'Setor criado com sucesso!' });
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao criar setor.' }); }
  }

  async function handleAddUserToSector(emailUser, sectorCode) {
    try {
      await addUserToSector(emailUser, sectorCode);
      alert("Usuário vinculado com sucesso!");
      loadData();
    } catch (error) { 
        alert("Erro ao vincular usuário."); 
    }
  }

  async function handleDeleteSector(id) {
    if (window.confirm("Desativar este setor?")) { await deleteSector(id); loadData(); }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      loadData();
      setMessage({ type: 'success', text: 'Categoria criada!' });
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao criar categoria.' }); }
  }

  async function handleDisableCategory(name) {
    if (window.confirm("Alterar status?")) { await disableCategory(name); loadData(); }
  }

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
      <Sidebar menuItems={MENU_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'users' ? 'Gestão de Usuários' : activeTab === 'sectors' ? 'Gestão de Setores' : 'Gestão de Categorias'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Registros: {currentListFull.length}</p>
            </div>
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {message.text && <div className="mb-6"><Alert type={message.type} message={message.text} /></div>}

        {/* ABA USUÁRIOS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Novo Usuário</h3>
              <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1"><Input label="Nome" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required /></div>
                <div className="md:col-span-1"><Input label="Email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required /></div>
                <div className="md:col-span-1">
                    <Select label="Permissão" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                        <option value="OPERATOR">Operador</option>
                        <option value="SECTOR_ADMIN">Admin Setor</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </Select>
                </div>
                <div className="md:col-span-1">
                    <Select label="Setor (Opcional)" value={selectedSectorId} onChange={e => setSelectedSectorId(e.target.value)}>
                        <option value="">Nenhum</option>
                        {sectorsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
                <div className="md:col-span-1"><Button type="submit">+ Cadastrar</Button></div>
              </form>
            </div>
            <TableContainer>
                <TableHeader headers={[{label:'Nome'}, {label:'Email'}, {label:'Permissão'}]} />
                <tbody className="divide-y divide-gray-100 text-sm">
                    {paginatedList.map((u, i) => (
                        <tr key={u.id || i} className="hover:bg-gray-50">
                            <td className="p-4 font-medium">{u.name}</td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4"><span className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                        </tr>
                    ))}
                </tbody>
            </TableContainer>
          </div>
        )}

        {/* ABA SETORES */}
        {activeTab === 'sectors' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Novo Setor</h3>
                 
                 {/* GRID DE 4 COLUNAS EM LINHA ÚNICA */}
                 <form onSubmit={handleCreateSector} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                     <Input label="Nome" value={newSector.name} onChange={e => setNewSector({...newSector, name: e.target.value})} required />
                     <Input label="Código" value={newSector.code} onChange={e => setNewSector({...newSector, code: e.target.value})} required />
                     <Input label="Descrição" value={newSector.description} onChange={e => setNewSector({...newSector, description: e.target.value})} />
                     
                     <div className="w-full">
                        <Button type="submit">
                            + Criar Setor
                        </Button>
                     </div>
                 </form>
             </div>
             
             {/* Lista de Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {paginatedList.map((sector) => (
                 <SectorCard 
                    key={sector.id}
                    sector={sector}
                    users={usersList}
                    onAddUser={handleAddUserToSector}
                    onDelete={handleDeleteSector}
                 />
               ))}
             </div>
           </div>
        )}

        {/* ABA CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Nova Categoria</h3>
                <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input label="Nome" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required />
                    <Input label="Descrição" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} />
                    <Button type="submit">+ Salvar</Button>
                </form>
            </div>
            <TableContainer>
                 <TableHeader headers={[{label:'Nome'}, {label:'Descrição'}, {label:'Ação', className:'text-right'}]} />
                 <tbody className="divide-y divide-gray-100 text-sm">
                     {paginatedList.map((cat, i) => (
                         <tr key={cat.id || i} className="hover:bg-gray-50">
                             <td className={`p-4 font-medium ${cat.enabled === false ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{cat.name}</td>
                             <td className="p-4 text-gray-500 truncate max-w-xs">{cat.description || "-"}</td>
                             <td className="p-4 text-right">
                                 <button onClick={() => handleDisableCategory(cat.name)} className={`text-xs px-3 py-1 rounded-full border font-bold ${cat.enabled === false ? 'text-gray-400' : 'text-red-600 border-red-200'}`}>
                                     {cat.enabled === false ? 'Reativar' : 'Desabilitar'}
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
            </TableContainer>
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>
    </div>
  );
}