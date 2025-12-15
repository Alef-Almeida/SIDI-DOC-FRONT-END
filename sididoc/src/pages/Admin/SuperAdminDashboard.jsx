import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiLayers, FiTag, FiPlus, FiTrash2, 
  FiUserPlus, FiLogOut, FiCheckCircle, FiChevronLeft, FiChevronRight, FiSearch
} from 'react-icons/fi';

import { 
  registerUser, getAllUsers,
  getAllSectors, createSector, deleteSector, addUserToSector,
  getAllCategories, createCategory, disableCategory 
} from '../../services/adminService';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // === PAGINAÇÃO ===
  const ITEMS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);

  // === DADOS ===
  const [usersList, setUsersList] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // === FORM STATES ===
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'SECTOR_ADMIN' });
  const [newSectorName, setNewSectorName] = useState('');
  const [selectedUserForSector, setSelectedUserForSector] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadData();
    setCurrentPage(1); // Reseta paginação ao trocar de aba
    setSearchTerm(''); // Limpa busca ao trocar de aba
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const users = await getAllUsers();
        setUsersList(users || []);
      } else if (activeTab === 'sectors') {
        const sectors = await getAllSectors();
        setSectorsList(sectors || []);
        // Precisamos da lista de users também para o dropdown de "Add User to Sector"
        const users = await getAllUsers(); 
        setUsersList(users || []);
      } else if (activeTab === 'categories') {
        const cats = await getAllCategories();
        setCategoriesList(cats || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  }

  // === LÓGICA DE PAGINAÇÃO & FILTRO ===
  const getCurrentList = () => {
    let list = [];
    if (activeTab === 'users') list = usersList;
    if (activeTab === 'sectors') list = sectorsList;
    if (activeTab === 'categories') list = categoriesList;

    // Filtro simples
    if (searchTerm) {
        list = list.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    return list;
  };

  const currentListFull = getCurrentList();
  const totalPages = Math.ceil(currentListFull.length / ITEMS_PER_PAGE);
  const paginatedList = currentListFull.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // === HANDLERS (Igual ao anterior, apenas resumido aqui) ===
  async function handleRegisterUser(e) {
    e.preventDefault();
    try {
      await registerUser(newUser);
      setMessage({ type: 'success', text: `Usuário ${newUser.name} cadastrado!` });
      setNewUser({ name: '', email: '', role: 'SECTOR_ADMIN' });
      loadData();
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao cadastrar.' }); }
  }

  async function handleCreateSector(e) {
    e.preventDefault();
    try {
      await createSector(newSectorName);
      setNewSectorName('');
      loadData();
      setMessage({ type: 'success', text: 'Setor criado!' });
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao criar setor.' }); }
  }

  async function handleAddUserToSector(sectorId) {
    if (!selectedUserForSector) return;
    try {
      await addUserToSector(selectedUserForSector, sectorId);
      alert("Usuário adicionado!");
      loadData();
    } catch (error) { alert("Erro ao adicionar."); }
  }

  async function handleDeleteSector(id) {
    if(window.confirm("Deletar setor?")) {
        await deleteSector(id);
        loadData();
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      await createCategory(newCategoryName);
      setNewCategoryName('');
      loadData();
      setMessage({ type: 'success', text: 'Categoria criada!' });
    } catch (error) { setMessage({ type: 'error', text: 'Erro ao criar.' }); }
  }

  async function handleDisableCategory(name) {
    await disableCategory(name);
    loadData();
  }

  const handleLogout = () => {
    localStorage.removeItem("sidi_token");
    localStorage.removeItem("sidi_user_name");
    localStorage.removeItem("sidi_user_role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="bg-white w-full md:w-64 border-r border-gray-200 p-6 flex flex-col justify-between shadow-lg z-10">
        <div>
            <h1 className="text-2xl font-extrabold text-cyan-600 mb-8 tracking-tight">SIDI ADMIN</h1>
            
            <nav className="space-y-2">
            <button onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FiUsers size={18} /> Usuários
            </button>
            <button onClick={() => setActiveTab('sectors')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sectors' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FiLayers size={18} /> Setores
            </button>
            <button onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FiTag size={18} /> Categorias
            </button>
            </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold mt-8">
            <FiLogOut /> Sair do Sistema
        </button>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'users' && 'Gestão de Usuários'}
                    {activeTab === 'sectors' && 'Gestão de Setores'}
                    {activeTab === 'categories' && 'Gestão de Categorias'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Visualizando {currentListFull.length} registros no total
                </p>
            </div>

            {/* Barra de Busca */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* MENSAGEM */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <FiCheckCircle /> {message.text}
          </div>
        )}

        {/* === ABA: USUÁRIOS === */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Form Cadastro Rápido */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Novo Cadastro</h3>
              <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <input type="text" placeholder="Nome Completo" className="p-2 border rounded-lg text-sm"
                    value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                <input type="email" placeholder="E-mail" className="p-2 border rounded-lg text-sm"
                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                <select className="p-2 border rounded-lg text-sm bg-white"
                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="SECTOR_ADMIN">Admin Setor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <button type="submit" className="bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 text-sm font-bold">
                    + Cadastrar
                </button>
              </form>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Permissão</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {paginatedList.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{u.name}</td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4"><span className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* === ABA: SETORES === */}
        {activeTab === 'sectors' && (
          <div className="space-y-6">
            {/* Criar Setor */}
            <form onSubmit={handleCreateSector} className="flex gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <input type="text" placeholder="Nome do novo setor..." className="flex-1 p-2 border rounded-lg text-sm"
                value={newSectorName} onChange={e => setNewSectorName(e.target.value)} required />
              <button type="submit" className="bg-cyan-600 text-white px-6 rounded-lg hover:bg-cyan-700 text-sm font-bold">
                + Criar Setor
              </button>
            </form>

            {/* Grid de Setores (Melhor que tabela para items complexos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedList.map(sector => (
                <div key={sector.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-800">{sector.name}</h3>
                        <p className="text-xs text-gray-500">{sector.users ? sector.users.length : 0} usuários vinculados</p>
                    </div>
                    <button onClick={() => handleDeleteSector(sector.id)} className="text-gray-400 hover:text-red-500 transition">
                        <FiTrash2 />
                    </button>
                  </div>
                  
                  {/* Mini Form para Adicionar Usuário */}
                  <div className="bg-gray-50 p-2 rounded-lg flex gap-1 mt-auto">
                    <select className="flex-1 text-xs bg-white border border-gray-200 rounded p-1"
                        onChange={e => setSelectedUserForSector(e.target.value)}>
                        <option value="">Add usuário...</option>
                        {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button onClick={() => handleAddUserToSector(sector.id)} className="bg-white border border-gray-200 text-cyan-600 hover:bg-cyan-50 p-1 rounded">
                        <FiUserPlus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ABA: CATEGORIAS === */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateCategory} className="flex gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <input type="text" placeholder="Nome da nova categoria..." className="flex-1 p-2 border rounded-lg text-sm"
                value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
              <button type="submit" className="bg-cyan-600 text-white px-6 rounded-lg hover:bg-cyan-700 text-sm font-bold">
                + Salvar Categoria
              </button>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Nome da Categoria</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {paginatedList.map(cat => (
                            <tr key={cat.id || cat.name} className="hover:bg-gray-50">
                                <td className={`p-4 font-medium ${cat.enabled === false ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                    {cat.name}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDisableCategory(cat.name)}
                                        className={`text-xs px-3 py-1 rounded-full border transition font-bold ${
                                            cat.enabled === false ? 'border-gray-300 text-gray-400' : 'border-red-200 text-red-600 hover:bg-red-50'
                                        }`}>
                                        {cat.enabled === false ? 'Desabilitado' : 'Desabilitar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* === PAGINAÇÃO CONTROLS === */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiChevronLeft />
                </button>
                <span className="text-sm font-bold text-gray-600">
                    Página {currentPage} de {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiChevronRight />
                </button>
            </div>
        )}

      </main>
    </div>
  );
}