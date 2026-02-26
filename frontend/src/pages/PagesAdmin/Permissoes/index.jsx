import React, { useState, useContext } from 'react';
import { FaUserShield, FaUserTie, FaUsers, FaCheckCircle, FaLock, FaEdit, FaShieldAlt, FaTimes, FaSave, FaToggleOn, FaToggleOff, FaPalette, FaUserMinus, FaUserSlash, FaUserCheck, FaTrashAlt } from 'react-icons/fa';
import styles from './Permissoes.module.css';
import { AuthContext } from '../../../context/AuthContext';

export default function Permissoes() {
  const { allAdmins, disableAdmin, enableAdmin, deleteAdmin, roles, updateRole, addRole, deleteRole, updateAdmin } = useContext(AuthContext);
  const [editingGroup, setEditingGroup] = useState(null);

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

  // Filtrar apenas admins comuns (não globais)
  const commonAdmins = allAdmins.filter(a => a.role !== 'global_admin');

  // Mock com mais campos
  // No local state for groups, using AuthContext roles

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
        <button className={styles.addRoleBtn} onClick={handleAddNewRole}>
          <FaUserShield /> Novo Perfil
        </button>
      </div>

      <div className={styles.rolesGrid}>
        {(roles || []).map((grupo) => (
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
                <FaEdit /> Configurar Acesso
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingGroup && (
        <div className={styles.modalOverlay} onClick={() => setEditingGroup(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editando Perfil</h2>
              <button className={styles.closeBtn} onClick={() => setEditingGroup(null)}><FaTimes /></button>
            </div>

            <div className={styles.modalBody}>
              {/* Seção 1: Dados Básicos */}
              <div className={styles.basicInfoSection}>
                <div className={styles.formGroup}>
                  <label>Nome do Perfil</label>
                  <input
                    type="text"
                    value={editingGroup.nome}
                    onChange={e => setEditingGroup({ ...editingGroup, nome: e.target.value })}
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={editingGroup.descricao}
                    onChange={e => setEditingGroup({ ...editingGroup, descricao: e.target.value })}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><FaPalette /> Cor do Badge</label>
                  <div className={styles.colorPicker}>
                    {['red', 'blue', 'green', 'purple', 'orange'].map(c => (
                      <div
                        key={c}
                        className={`${styles.colorOption} ${styles[`bg-${c}`]} ${editingGroup.color === c ? styles.selectedColor : ''}`}
                        onClick={() => handleColorChange(c)}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Nível de Hierarquia</label>
                  <select
                    className={styles.inputField}
                    value={editingGroup.nivel || 'Tático'}
                    onChange={e => setEditingGroup({ ...editingGroup, nivel: e.target.value })}
                  >
                    <option value="Estratégico">Estratégico</option>
                    <option value="Tático">Tático</option>
                    <option value="Operacional">Operacional</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Segurança (MFA)</label>
                  <select
                    className={styles.inputField}
                    value={editingGroup.mfaStatus || 'Opcional'}
                    onChange={e => setEditingGroup({ ...editingGroup, mfaStatus: e.target.value })}
                  >
                    <option value="Obrigatório">Obrigatório</option>
                    <option value="Opcional">Opcional</option>
                    <option value="Desativado">Desativado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Limite de Sessões</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingGroup.sessionLimit || 1}
                    onChange={e => setEditingGroup({ ...editingGroup, sessionLimit: parseInt(e.target.value) })}
                    className={styles.inputField}
                  />
                </div>
              </div>

              {/* Seção 2: Permissões Detalhadas */}
              <h3 className={styles.sectionDivider}>Permissões por Módulo</h3>

              <div className={styles.permissionsGrid}>
                {Object.entries(editingGroup.config || {}).map(([category, perms]) => (
                  <div key={category} className={styles.moduleCard}>
                    <h4 className={styles.moduleTitle}>{category.toUpperCase()}</h4>
                    <div className={styles.togglesList}>
                      {Object.entries(perms || {}).map(([key, value]) => (
                        <div
                          key={key}
                          className={styles.toggleRow}
                          onClick={() => handleToggle(category, key)}
                        >
                          <span>{key}</span>
                          <div className={`${styles.toggleSwitch} ${value ? styles.on : styles.off}`}>
                            <div className={styles.toggleKnob}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              {editingGroup.id && (
                <button className={styles.btnDelete} onClick={() => { deleteRole(editingGroup.id); setEditingGroup(null); }}>Excluir Perfil</button>
              )}
              <div className={styles.footerActions}>
                <button className={styles.btnCancel} onClick={() => setEditingGroup(null)}>Cancelar</button>
                <button className={styles.btnSave} onClick={handleSave}>
                  <FaSave /> {editingGroup.id ? 'Salvar Alterações' : 'Criar Perfil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Seção de Gestão de Administradores Comuns */}
      <div className={styles.adminManagementSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Administradores Comuns</h2>
            <span className={styles.sectionSubtitle}>Gerencie o status e acesso dos administradores de nível comum</span>
          </div>
          {commonAdmins.length > 0 && (
            <button
              className={styles.clearAllAdminsBtn}
              onClick={() => {
                if (window.confirm('Tem certeza que deseja eliminar TODOS os administradores comuns?')) {
                  commonAdmins.forEach(admin => deleteAdmin(admin.id));
                }
              }}
            >
              <FaTrashAlt /> Eliminar Todos
            </button>
          )}
        </div>

        <div className={styles.adminGrid}>
          {commonAdmins.length === 0 ? (
            <div className={styles.emptyState}>Nenhum administrador comum cadastrado ou pendente.</div>
          ) : (
            (commonAdmins || []).map(admin => (
              <div key={admin.id} className={styles.adminCard}>
                <div className={styles.adminInfo}>
                  <div className={styles.adminAvatar}>
                    {admin.foto ? <img src={admin.foto} alt={admin.username} /> : <span>{(admin.username || 'A').charAt(0)}</span>}
                  </div>
                  <div className={styles.adminDetails}>
                    <h3 className={styles.adminName}>{admin.username || 'Usuário sem nome'}</h3>
                    <p className={styles.adminEmail}>{admin.email}</p>
                    <span className={`${styles.statusBadge} ${styles[admin.status]}`}>
                      {admin.status === 'pending' ? 'Pendente' : (admin.status === 'disabled' ? 'Desativado' : 'Aprovado')}
                    </span>
                    <div className={styles.roleAssign}>
                      <label>Perfil de Acesso:</label>
                      <select
                        value={admin.role}
                        onChange={(e) => updateAdmin(admin.id, { role: e.target.value })}
                        disabled={admin.status === 'pending'}
                      >
                        <option value="admin">Padrão</option>
                        {(roles || []).map(r => (
                          <option key={r.id} value={r.nome}>{r.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.adminActions}>
                  {admin.status === 'disabled' ? (
                    <button
                      className={styles.enableBtn}
                      onClick={() => enableAdmin(admin.id)}
                      title="Ativar Acesso"
                    >
                      <FaUserCheck /> Habilitar
                    </button>
                  ) : (
                    <button
                      className={styles.disableBtn}
                      onClick={() => disableAdmin(admin.id)}
                      title="Bloquear Login"
                    >
                      <FaUserSlash /> Desabilitar
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteAdmin(admin.id)}
                    title="Remover permanentemente"
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
