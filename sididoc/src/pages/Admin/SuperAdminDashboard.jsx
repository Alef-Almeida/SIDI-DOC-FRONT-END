import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiLayers,
  FiTag,
  FiEdit3,
  FiX,
  FiTrash2,
  FiShield,
  FiBriefcase,
  FiMenu,
  FiLogOut,
  FiAlertTriangle // <--- NOVO ÍCONE PARA O ALERTA
} from "react-icons/fi";

import {
  registerUser,
  getAllUsers,
  getAllSectors,
  createSector,
  deleteSector,
  addUserToSector,
  getAllCategories,
  createCategory,
  disableCategory,
  updateUser,
  removeUserFromSector,
  deleteUser
} from "../../services/adminService";

// COMPONENTES
import { Sidebar } from "../../components/Sidebar";
import { SearchInput } from "../../components/SearchInput";
import { Alert } from "../../components/Alert";
import { Select } from "../../components/Select";
import { Pagination } from "../../components/Pagination";
import { TableContainer, TableHeader } from "../../components/TableContainer";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { SectorCard } from "../../components/SectorCard";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ITEMS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);

  const [usersList, setUsersList] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // === ESTADOS DOS MODAIS ===
  // Modal Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Modal Exclusão (NOVO)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Forms
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "OPERATOR" });
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [newSector, setNewSector] = useState({ name: "", code: "", description: "" });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const MENU_ITEMS = [
    { id: "users", label: "Usuários", icon: FiUsers },
    { id: "sectors", label: "Setores", icon: FiLayers },
    { id: "categories", label: "Categorias", icon: FiTag },
  ];

  useEffect(() => {
    loadData();
    setCurrentPage(1);
    setSearchTerm("");
    setMessage({ type: "", text: "" });
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const sectorsData = await getAllSectors();
      setSectorsList(Array.isArray(sectorsData) ? sectorsData : []);

      const usersData = await getAllUsers();
      setUsersList(Array.isArray(usersData) ? usersData : []);

      if (activeTab === "categories") {
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
    if (activeTab === "users") list = usersList;
    if (activeTab === "sectors") list = sectorsList;
    if (activeTab === "categories") list = categoriesList;
    if (!Array.isArray(list)) return [];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
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
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ... (HANDLERS DE CRIAÇÃO - MANTIDOS IGUAIS) ...
  async function handleRegisterUser(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      const sectorArray = selectedSectorId ? [Number(selectedSectorId)] : [];
      await registerUser({ ...newUser, sectorIds: sectorArray });
      setMessage({ type: "success", text: `Usuário ${newUser.name} cadastrado!` });
      setNewUser({ name: "", email: "", role: "OPERATOR" });
      setSelectedSectorId("");
      loadData();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao cadastrar usuário." });
    }
  }

  async function handleCreateSector(e) {
    e.preventDefault();
    try {
      await createSector(newSector);
      setNewSector({ name: "", code: "", description: "" });
      loadData();
      setMessage({ type: "success", text: "Setor criado!" });
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao criar setor." });
    }
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
    if (window.confirm("Desativar este setor?")) {
      await deleteSector(id);
      loadData();
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setNewCategory({ name: "", description: "" });
      loadData();
      setMessage({ type: "success", text: "Categoria criada!" });
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao criar categoria." });
    }
  }

  async function handleDisableCategory(name) {
    if (window.confirm("Alterar status?")) {
      await disableCategory(name);
      loadData();
    }
  }

  // === HANDLERS DE EDIÇÃO ===
  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const dto = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };
      await updateUser(editingUser.id, dto);
      alert("Atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    }
  };

  const handleRemoveFromSector = async (sectorCode) => {
    if (!window.confirm(`Remover do setor ${sectorCode}?`)) return;
    try {
      await removeUserFromSector(sectorCode, editingUser.email);
      const updatedSectors = editingUser.sectors.filter(s => s.code !== sectorCode);
      setEditingUser({ ...editingUser, sectors: updatedSectors });
      loadData();
    } catch (error) {
      alert("Erro ao remover do setor.");
    }
  };

  // === HANDLERS DE EXCLUSÃO (NOVO FLUXO) ===
  
  // 1. Abre o modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // 2. Confirma a exclusão
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setMessage({ type: "success", text: "Usuário excluído com sucesso." });
      loadData();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao excluir usuário." });
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleMobileTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">
      
      {/* HEADER MOBILE */}
      <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <span className="font-bold text-gray-800 text-lg">SIDI ADMIN</span>
        <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><FiLogOut size={24} /></button>
      </header>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white shadow-lg border-b border-gray-200 z-20 animate-slideDown">
          <nav className="flex flex-col py-2">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMobileTabChange(item.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition ${activeTab === item.id ? "text-cyan-600 bg-cyan-50 border-l-4 border-cyan-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:flex">
        <Sidebar menuItems={MENU_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      </div>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto h-[calc(100vh-64px)] md:h-screen scroll-smooth">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
              {activeTab === "users" ? "Gestão de Usuários" : activeTab === "sectors" ? "Gestão de Setores" : "Gestão de Categorias"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Registros encontrados: {currentListFull.length}</p>
          </div>
          <div className="w-full md:w-auto"><SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>

        {message.text && (
          <div className="mb-6 animate-fadeIn"><Alert type={message.type} message={message.text} /></div>
        )}

        {/* ABA USUÁRIOS */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wide">Novo Usuário</h3>
              <form onSubmit={handleRegisterUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="sm:col-span-1"><Input label="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required /></div>
                <div className="sm:col-span-1"><Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required /></div>
                <div className="sm:col-span-1">
                  <Select label="Permissão" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="OPERATOR">Operador</option>
                    <option value="SECTOR_ADMIN">Admin Setor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </Select>
                </div>
                <div className="sm:col-span-1">
                  <Select label="Setor (Opcional)" value={selectedSectorId} onChange={(e) => setSelectedSectorId(e.target.value)}>
                    <option value="">Nenhum</option>
                    {sectorsList.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </Select>
                </div>
                <div className="sm:col-span-2 lg:col-span-1"><Button type="submit" className="w-full">+ Cadastrar</Button></div>
              </form>
            </div>

            <TableContainer>
              <TableHeader headers={[{ label: "Nome" }, { label: "Email" }, { label: "Permissão" }, { label: "Status", className: "text-center" }, { label: "Ações", className: "text-right" }]} />
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedList.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{u.name}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4"><span className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">{u.role}</span></td>
                    <td className="p-4 text-center">
                      {u.isFirstAccess ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ativo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(u)} 
                          className="p-2 bg-gray-100 hover:bg-cyan-100 text-gray-500 hover:text-cyan-600 rounded-lg transition"
                          title="Editar Detalhes"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(u)} // <--- Alterado para abrir o modal
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition"
                          title="Excluir Usuário"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>
        )}

        {/* ... (SETORES e CATEGORIAS mantidos iguais) ... */}
        {activeTab === "sectors" && (
           <div className="space-y-6">
             <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wide">Novo Setor</h3>
               <form onSubmit={handleCreateSector} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <Input label="Nome" value={newSector.name} onChange={e => setNewSector({...newSector, name: e.target.value})} required />
                  <Input label="Código" value={newSector.code} onChange={e => setNewSector({...newSector, code: e.target.value})} required />
                  <Input label="Descrição" value={newSector.description} onChange={e => setNewSector({...newSector, description: e.target.value})} />
                  <div className="w-full"><Button type="submit">+ Criar Setor</Button></div>
               </form>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {paginatedList.map(sector => (
                  <SectorCard key={sector.id} sector={sector} users={usersList} onAddUser={handleAddUserToSector} onDelete={handleDeleteSector} />
                ))}
             </div>
           </div>
        )}

        {activeTab === "categories" && (
           <div className="space-y-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wide">Nova Categoria</h3>
                 <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input label="Nome" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required />
                    <Input label="Descrição" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} />
                    <div className="w-full"><Button type="submit">+ Salvar</Button></div>
                 </form>
              </div>
              <TableContainer>
                <TableHeader headers={[{label:"Nome"}, {label:"Descrição"}, {label:"Ação", className:"text-right"}]} />
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedList.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                       <td className={`p-4 font-medium ${cat.enabled===false?'text-gray-400 line-through':'text-gray-800'}`}>{cat.name}</td>
                       <td className="p-4 text-gray-500 truncate max-w-xs">{cat.description||"-"}</td>
                       <td className="p-4 text-right">
                          <button onClick={()=>handleDisableCategory(cat.name)} className={`text-xs px-3 py-1 rounded-full border font-bold ${cat.enabled===false?'text-gray-400 bg-gray-50':'text-red-600 border-red-200 bg-red-50'}`}>
                             {cat.enabled===false?"Reativar":"Desabilitar"}
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

      {/* === MODAL DE EDIÇÃO === */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><FiUsers className="text-cyan-600" /> Detalhes do Usuário</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><FiX size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleUpdateUser} className="space-y-5">
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-800 uppercase">ID: #{editingUser.id}</span>
                  {!editingUser.isFirstAccess ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">ATIVO</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PENDENTE</span>
                  )}
                </div>
                <div className="space-y-4">
                  <Input label="Nome Completo" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
                  <div>
                    <Input 
                      label="Email" 
                      type="email"
                      value={editingUser.email} 
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                      required 
                      disabled={!editingUser.isFirstAccess} 
                    />
                    {!editingUser.isFirstAccess && <p className="text-[10px] text-amber-600 mt-1 font-medium">* E-mail travado para usuários ativos.</p>}
                  </div>
                  <Select label="Permissão" icon={FiShield} value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="OPERATOR">Operador</option>
                    <option value="SECTOR_ADMIN">Admin Setor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </Select>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><FiBriefcase /> Setores Vinculados</h4>
                  {editingUser.sectors && editingUser.sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editingUser.sectors.map(sector => (
                        <div key={sector.id} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700">
                          <span>{sector.name}</span>
                          <button type="button" onClick={() => handleRemoveFromSector(sector.code)} className="text-gray-400 hover:text-red-500 transition p-0.5 rounded-full hover:bg-white"><FiX size={14} /></button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400 italic">Nenhum setor vinculado.</p>}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" className="w-full">Salvar Alterações</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (NOVO) === */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-scaleIn border border-gray-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">Excluir Usuário?</h3>
            
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Você está prestes a excluir <strong>{userToDelete.name}</strong>. 
              <br />
              Esta ação é permanente e não poderá ser desfeita.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}