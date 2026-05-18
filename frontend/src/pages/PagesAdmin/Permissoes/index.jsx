import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaUserTie, FaUsers, FaCheckCircle, FaLock, FaEdit, FaShieldAlt, FaTimes, FaSave, FaToggleOn, FaToggleOff, FaPalette, FaUserMinus, FaUserSlash, FaUserCheck, FaTrashAlt, FaSearch, FaCogs, FaShieldVirus, FaUserPlus, FaFilter } from 'react-icons/fa';
import styles from './Permissoes.module.css';
import { AuthContext } from '../../../context/AuthContext';
import { EmployeeContext } from '../../../context/EmployeeContext';

export default function Permissoes() {
  const {
    allAdmins, disableAdmin, enableAdmin, deleteAdmin,
    roles, updateRole, addRole, deleteRole, updateAdmin,
    promoteEmployee, currentUser, allUsers, disableUser, enableUser, deleteUser, updateUser, getApiUrl
  } = useContext(AuthContext);

  const { employees, departments } = useContext(EmployeeContext);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('geral'); // 'geral', 'modulos', 'seguranca'
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState(''); // New: search for employee management

  // New states for adding admin from employee
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedUserDept, setSelectedUserDept] = useState(''); // New: filter for employee management section
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const handleAddNewRole = () => {
    const template = {
      nome: 'Novo Perfil',
      descricao: 'Descrição do novo perfil de acesso.',
      color: 'blue',
      usersCount: 0,
      permissoes: [],
      nivel: 'Tático',
      mfaStatus: 'Opcional',
      sessionLimit: 3,
      config: {
        dashboard: { 'Painel Executivo': false, 'Métricas Avançadas': false, 'Previsões': false, 'Exportar Widgets': false, 'Heatmaps': false },
        funcionarios: { 'Ver Lista': true, 'Cadastrar': false, 'Editar': false, 'Eliminar': false, 'Ver Salários': false, 'Contratos': false, 'Gerir Férias': false, 'Documentação': false },
        departamentos: { 'Visualizar': true, 'Gerir': false, 'Reestruturar': false, 'Orçamentos': false, 'Hierarquia': false },
        avaliacoes: { 'Realizar': false, 'Ver Histórico': false, 'Aprovar Ciclos': false, 'Configurar Metas': false, 'Calibração': false },
        financeiro: { 'Folha de Pagamento': false, 'Bônus & Prêmios': false, 'Benefícios': false, 'Reembolsos': false, 'Auditoria de Custos': false },
        relatorios: { 'Acessar': false, 'Customizar Dashboards': false, 'Agendar Envios': false, 'Analise de Retenção': false },
        comunicacao: { 'Mensagens Globais': false, 'Feedbacks': true, 'Notificações Push': false, 'Pesquisas de Clima': false, 'Mural Empresa': true },
        sistema: { 'Permissões': false, 'Logs de Auditoria': false, 'Configurações': false, 'Backups': false, 'Integrações API': false, 'Licenciamento': false }
      }
    };
    setEditingGroup(template);
  };

  const handleSave = () => {
    if (editingGroup.id) {
      updateRole(editingGroup.id, editingGroup);
    } else {
      addRole(editingGroup);
    }
    setEditingGroup(null);
  };

  // Filtrar apenas os admins comuns (não globais e não funcionários demitidos)
  const commonAdmins = (allAdmins || []).filter(a => {
    const roleSlug = (a.role || '').toLowerCase().trim();
    const isGlobal = roleSlug === 'global_admin' || roleSlug === 'global admin' || a.username === 'Aylton Dinis' || a.nome_completo === 'Aylton Dinis';
    const isEmployee = roleSlug === 'employee' || roleSlug === 'funcionario' || roleSlug === 'colaborador';
    const isCurrentUser = String(a.id) === String(currentUser?.id);

    return !isGlobal && !isCurrentUser && !isEmployee &&
      (a.username?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        a.nome_completo?.toLowerCase().includes(adminSearchTerm.toLowerCase()));
  });

  const employeeUsers = React.useMemo(() => {
    const combined = [...(allUsers || []), ...(allAdmins || [])];
    // De-duplicar por email, mantendo os que têm role mais 'importantes' se for o caso
    const uniqueMap = new Map();
    combined.forEach(u => {
      if (!u.email) return;
      const key = u.email.toLowerCase().trim();
      // Priorizar os dados que vêm de allAdmins se o e-mail for o mesmo (mais chances de estarem completos)
      if (!uniqueMap.has(key) || u.id_cadastro_admin) {
        uniqueMap.set(key, u);
      }
    });

    return Array.from(uniqueMap.values()).filter(u => {
      const role = (u.role || '').toLowerCase().trim();
      const isGlobal = role === 'global_admin' || u.username === 'Aylton Dinis' || u.nome_completo === 'Aylton Dinis';
      const matchesDept = !selectedUserDept || u.departamento === selectedUserDept;
      
      const search = userSearchTerm.toLowerCase();
      const matchesSearch = !userSearchTerm || 
        (u.username || '').toLowerCase().includes(search) || 
        (u.nome_completo || '').toLowerCase().includes(search) || 
        (u.email || '').toLowerCase().includes(search);

      return !isGlobal && matchesDept && matchesSearch;
    });
  }, [allUsers, allAdmins, selectedUserDept, userSearchTerm]);

  const filteredRoles = (roles || []).filter(r =>
    r.nome.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
    r.descricao.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  const handleAddAdminFromEmployee = async () => {
    if (!selectedEmpId) return;
    const emp = employees.find(e => e.id.toString() === selectedEmpId.toString());
    if (!emp) return;

    const alreadyAdmin = allAdmins.some(a => a.email === emp.email);
    if (alreadyAdmin) {
      alert('Este funcionário já é um administrador.');
      return;
    }

    if (window.confirm(`Deseja tornar ${emp.nome} um administrador com acesso total ao sistema?`)) {
      const result = await promoteEmployee(selectedEmpId);
      if (result.success) {
        alert(`${emp.nome} agora é um administrador oficial!`);
        setSelectedEmpId('');
      } else {
        alert(`Erro: ${result.message}`);
      }
    }
  };

  const filteredEmployeesForAdmin = employees.filter(emp => {
    const inSelectedDept = !selectedDept || emp.dept === selectedDept;
    const notAdmin = !allAdmins.some(a => a.email === emp.email);
    return inSelectedDept && notAdmin;
  });

  const handleToggle = (category, key) => {
    setEditingGroup(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [category]: {
          ...prev.config[category],
          [key]: !prev.config[category][key]
        }
      }
    }));
  };

  const handleColorChange = (color) => {
    setEditingGroup(prev => ({ ...prev, color }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Controle de Acesso</h1>
          <p style={{ color: '#64748b' }}>Definição estratégica de perfis e permissões</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar perfil de acesso..."
            value={roleSearchTerm}
            onChange={e => setRoleSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.headerActions}>
          {currentUser?.role?.toLowerCase().trim() === 'global_admin' && (
            <button className={styles.addRoleBtn} onClick={handleAddNewRole}>
              <FaUserShield /> Adicionar
            </button>
          )}
        </div>
      </div>

      <div className={styles.rolesGrid}>
        {filteredRoles.map((grupo) => (
          <div key={grupo.id} className={`${styles.roleCard} ${styles[`border-${grupo.color}`]} card-modern`}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconBox} ${styles[`bg-${grupo.color}`]}`}>
                <FaShieldAlt />
              </div>
              <div className={styles.userBadge}>
                <FaUsers /> {grupo.usersCount}
              </div>
            </div>

            <h2 className={styles.roleName}>{grupo.nome}</h2>
            <p className={styles.roleDesc}>{grupo.descricao}</p>

            <div className={styles.permissionsPreview}>
              {(grupo.permissoes || []).map((p, i) => (
                <span key={i} className={styles.permTag}>{p}</span>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <button className={styles.editBtn} onClick={() => setEditingGroup(grupo)}>
                <FaEdit /> Configurar
              </button>
              {currentUser?.role?.toLowerCase().trim() === 'global_admin' && (
                <button
                  className={`${styles.editBtn} ${styles.deleteRoleBtn}`}
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir o perfil "${grupo.nome}"?`)) {
                      deleteRole(grupo.id);
                    }
                  }}
                  title="Excluir Perfil"
                >
                  <FaTrashAlt />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingGroup && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingGroup(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderInfo}>
                  <div className={`${styles.modalHeaderIcon} ${styles[`bg-${editingGroup.color}`]}`}>
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h2 className={styles.modalTitle}>{editingGroup.id ? 'Configurar Perfil' : 'Novo Perfil'}</h2>
                    <p className={styles.modalSubtitle}>{editingGroup.nome}</p>
                  </div>
                </div>
                <button className={styles.closeBtn} onClick={() => setEditingGroup(null)}><FaTimes /></button>
              </div>

              <div className={styles.modalTabs}>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'geral' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('geral')}
                >
                  <FaCogs /> Dados Gerais
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'modulos' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('modulos')}
                >
                  <FaLock /> Permissões
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'seguranca' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('seguranca')}
                >
                  <FaShieldVirus /> Segurança
                </button>
              </div>

              <div className={styles.modalBody}>
                {activeTab === 'geral' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={styles.tabContent}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nome do Perfil</label>
                        <input
                          type="text"
                          value={editingGroup.nome}
                          onChange={e => setEditingGroup({ ...editingGroup, nome: e.target.value })}
                          className={styles.inputField}
                          placeholder="Ex: Gestor Financeiro"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Descrição Curta</label>
                        <input
                          type="text"
                          value={editingGroup.descricao}
                          onChange={e => setEditingGroup({ ...editingGroup, descricao: e.target.value })}
                          className={styles.inputField}
                          placeholder="Finalidade deste perfil..."
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label><FaPalette /> Cor de Identificação</label>
                      <div className={styles.colorPicker}>
                        {['red', 'blue', 'green', 'purple', 'orange'].map(c => (
                          <div
                            key={c}
                            className={`${styles.colorOption} ${styles[`bg-${c}`]} ${editingGroup.color === c ? styles.selectedColor : ''}`}
                            onClick={() => handleColorChange(c)}
                          >
                            {editingGroup.color === c && <FaCheckCircle />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'modulos' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={styles.tabContent}>
                    <div className={styles.permissionsGrid}>
                      {Object.entries(editingGroup.config || {}).map(([category, perms]) => (
                        <details key={category} className={styles.moduleCard}>
                          <summary className={styles.moduleHeader}><h4>{category.toUpperCase()}</h4></summary>
                          <div className={styles.togglesList}>
                            {Object.entries(perms || {}).map(([key, value]) => (
                              <div key={key} className={styles.toggleRow} onClick={() => handleToggle(category, key)}>
                                <span>{key}</span>
                                <div className={`${styles.premiumSwitch} ${value ? styles.switchOn : styles.switchOff}`}>
                                  <div className={styles.switchHandle}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'seguranca' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={styles.tabContent}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Nível de Hierarquia</label>
                        <select
                          className={styles.inputField}
                          value={editingGroup.nivel || 'Tático'}
                          onChange={e => setEditingGroup({ ...editingGroup, nivel: e.target.value })}
                        >
                          <option value="Estratégico">Estratégico (Alta Gestão)</option>
                          <option value="Tático">Tático (Gerência)</option>
                          <option value="Operacional">Operacional (Execução)</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Segurança (MFA)</label>
                        <select
                          className={styles.inputField}
                          value={editingGroup.mfaStatus || 'Opcional'}
                          onChange={e => setEditingGroup({ ...editingGroup, mfaStatus: e.target.value })}
                        >
                          <option value="Obrigatório">Obrigatório (Seguro)</option>
                          <option value="Opcional">Opcional</option>
                          <option value="Desativado">Desativado</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.footerLeft}>
                  {editingGroup.id && (
                    <button className={styles.btnDelete} onClick={() => { deleteRole(editingGroup.id); setEditingGroup(null); }}>
                      <FaTrashAlt /> Excluir Perfil
                    </button>
                  )}
                </div>
                <div className={styles.footerRight}>
                  <button className={styles.btnCancel} onClick={() => setEditingGroup(null)}>Cancelar</button>
                  <button className={styles.btnSave} onClick={handleSave}>
                    <FaSave /> {editingGroup.id ? 'Salvar Alterações' : 'Criar Perfil'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.adminManagementSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Administradores Comuns</h2>
            <span className={styles.sectionSubtitle}>Gerencie o status e acesso dos administradores de nível comum</span>
          </div>
        </div>

        <div className={styles.toolbar} style={{ marginTop: '20px' }}>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar administrador por nome ou email..."
              value={adminSearchTerm}
              onChange={e => setAdminSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.headerActions}>
            {commonAdmins.length > 0 && (
              <button
                className={styles.clearAllAdminsBtn}
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja eliminar TODOS os administradores comuns?')) {
                    commonAdmins.forEach(admin => deleteAdmin(admin.id));
                  }
                }}
              >
                <FaTrashAlt /> Eliminar
              </button>
            )}
          </div>
        </div>

        {currentUser?.role?.toLowerCase().trim() === 'global_admin' && (
          <div className={styles.addFromEmployeeCard}>
            <div className={styles.cardInfo}>
              <div className={styles.cardIcon}><FaUserPlus /></div>
              <div>
                <h3>Adicionar de Funcionários</h3>
                <p>Promova um funcionário existente para administrador</p>
              </div>
            </div>
            <div className={styles.cardFilters}>
              <div className={styles.filterGroup}>
                <label>Departamento</label>
                <select
                  value={selectedDept}
                  onChange={e => { setSelectedDept(e.target.value); setSelectedEmpId(''); }}
                  className={styles.filterSelect}
                >
                  <option value="">Todos Departamentos</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.nome}>{d.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Funcionário</label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className={styles.filterSelect}
                  disabled={filteredEmployeesForAdmin.length === 0}
                >
                  <option value="">Selecione um funcionário...</option>
                  {filteredEmployeesForAdmin.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome} ({emp.cargo})</option>
                  ))}
                </select>
              </div>
              <button
                className={styles.btnAddAdmin}
                disabled={!selectedEmpId}
                onClick={handleAddAdminFromEmployee}
              >
                Adicionar Admin
              </button>
            </div>
          </div>
        )}

        <div className={styles.adminGrid}>
          {commonAdmins.length === 0 ? (
            <div className={styles.emptyState}>Nenhum administrador comum cadastrado ou pendente.</div>
          ) : (
            commonAdmins.map(admin => (
              <div key={admin.id} className={styles.adminCard}>
                <div className={styles.adminInfo}>
                  <div className={styles.adminAvatar}>
                    {admin.foto && typeof admin.foto === 'string' && admin.foto.length > 5 ? (
                      <img src={(admin.foto.startsWith('data:image') || admin.foto.startsWith('http')) ? admin.foto : getApiUrl('/' + admin.foto)} alt={admin.username} />
                    ) : (
                      <span>{(admin.username || admin.nome_completo || 'A').charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.adminDetails}>
                    <h3 className={styles.adminName}>{admin.nome_completo || admin.username || 'Usuário sem nome'}</h3>
                    <p className={styles.adminEmail}>{admin.email}</p>
                    <span className={`${styles.statusBadge} ${styles[admin.status]}`}>
                      {admin.status === 'pending' ? 'Pendente' : (admin.status === 'disabled' ? 'Bloqueado' : 'Ativo')}
                    </span>
                    <div className={styles.roleAssign}>
                      <label>Perfil de Acesso:</label>
                      <select
                        value={admin.role}
                        onChange={(e) => updateAdmin(admin.id, { role: e.target.value })}
                        disabled={admin.status === 'pending'}
                      >
                        <option value="admin">Padrão</option>
                        <option value="gestor">Gestor (Admin Comum)</option>
                        <option value="funcionario">Funcionário</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.adminActions}>
                  {admin.status === 'disabled' ? (
                    <button className={styles.enableBtn} onClick={() => enableAdmin(admin.id)} title="Ativar Acesso">
                      <FaUserCheck /> Habilitar
                    </button>
                  ) : (
                    <button className={styles.disableBtn} onClick={() => disableAdmin(admin.id)} title="Bloquear Login">
                      <FaUserSlash /> Bloquear
                    </button>
                  )}
                  <button className={styles.deleteBtn} onClick={() => deleteAdmin(admin.id)} title="Remover permanentemente">
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* NOVA SEÇÃO: GESTÃO DE ACESSO DE FUNCIONÁRIOS */}
        {currentUser?.role?.toLowerCase().trim() === 'global_admin' && (
          <>
            <div className={styles.sectionHeader} style={{ marginTop: '40px' }}>
              <h2 className={styles.sectionTitle}>
                <FaUsers /> Gestão de Acesso - Funcionários
              </h2>
              <p className={styles.sectionSubtitle}>Bloquear ou eliminar acessos de colaboradores comuns</p>
            </div>

            <div className={styles.filterToolbar}>
              <div className={styles.filterGroup}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={selectedUserDept}
                  onChange={e => setSelectedUserDept(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos os Departamentos</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.nome}>{d.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <FaSearch className={styles.filterIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={userSearchTerm}
                  onChange={e => setUserSearchTerm(e.target.value)}
                  className={styles.filterSelect}
                  style={{ width: '250px' }}
                />
              </div>
              <div className={styles.resultsBadge}>
                {employeeUsers.length} Funcionário(s) encontrado(s)
              </div>
            </div>
            <div className={styles.adminGrid}>
              {employeeUsers.length === 0 ? (
                <div className={styles.emptyState}>Nenhum funcionário cadastrado.</div>
              ) : (
                employeeUsers.map(user => (
                  <div key={user.id} className={styles.adminCard}>
                    <div className={styles.adminInfo}>
                      <div className={styles.adminAvatar} style={{ background: '#e2e8f0', color: '#64748b' }}>
                        {user.foto && typeof user.foto === 'string' && user.foto.length > 5 ? (
                          <img src={(user.foto.startsWith('data:image') || user.foto.startsWith('http')) ? user.foto : getApiUrl('/' + user.foto)} alt={user.username} />
                        ) : (
                          <span>{(user.username || user.nome_completo || 'F').charAt(0)}</span>
                        )}
                      </div>
                      <div className={styles.adminDetails}>
                        <h3 className={styles.adminName}>{user.nome_completo || user.username}</h3>
                        <p className={styles.adminEmail}>{user.email} <span style={{opacity:0.6}}>- {user.departamento || 'Sem Dept.'}</span></p>
                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                          {user.status === 'disabled' ? 'Bloqueado' : 'Ativo'}
                        </span>
                        <div className={styles.roleAssign} style={{ marginTop: '8px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '600' }}>Perfil de Acesso:</label>
                          <select
                            value={user.role}
                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                            style={{ padding: '4px', fontSize: '12px', borderRadius: '4px', marginLeft: '5px' }}
                          >
                            <option value="admin">Padrão</option>
                            <option value="gestor">Gestor (Admin Comum)</option>
                            <option value="funcionario">Funcionário</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className={styles.adminActions}>
                      {user.status === 'disabled' ? (
                        <button className={styles.enableBtn} onClick={() => enableUser(user.id)} title="Desbloquear Funcionário">
                          <FaUserCheck /> Desbloquear
                        </button>
                      ) : (
                        <button className={styles.disableBtn} onClick={() => disableUser(user.id)} title="Bloquear Funcionário">
                          <FaUserSlash /> Bloquear
                        </button>
                      )}
                      <button className={styles.deleteBtn} onClick={() => deleteUser(user.id)} title="Eliminar Conta Permanente">
                        <FaTrashAlt /> Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
