import React, { useState } from 'react';
import { FaUserShield, FaUserTie, FaUsers, FaCheckCircle, FaLock, FaEdit, FaShieldAlt, FaTimes, FaSave, FaToggleOn, FaToggleOff, FaPalette } from 'react-icons/fa';
import styles from './Permissoes.module.css';

export default function Permissoes() {
  const [editingGroup, setEditingGroup] = useState(null);

  // Mock com mais campos
  const [grupos, setGrupos] = useState([
    {
      id: 1,
      nome: 'Administradores',
      descricao: 'Acesso total ao sistema e configurações globais.',
      icon: <FaShieldAlt />,
      color: 'red',
      usersCount: 3,
      permissoes: ['Acesso Irrestrito', 'Gestão Financeira Completa'],
      config: {
        sistema: { 'Painel de Controle': true, 'Logs de Auditoria': true, 'Backups': true, 'Configurações API': true },
        financeiro: { 'Ver Todo Fluxo': true, 'Aprovar Pagamentos': true, 'Relatórios Fiscais': true },
        pessoas: { 'Admissão/Demissão': true, 'Gerir Salários': true, 'Acesso a Dados Sensíveis': true },
        academico: { 'Criar Cursos': true, 'Fechar Pautas': true },
        documentos: { 'Arquivos Sigilosos': true, 'Excluir Documentos': true }
      }
    },
    {
      id: 2,
      nome: 'Gestores de Área',
      descricao: 'Liderança de equipes e processos departamentais.',
      icon: <FaUserTie />,
      color: 'blue',
      usersCount: 8,
      permissoes: ['Gestão de Equipe', 'Aprovação de Férias'],
      config: {
        sistema: { 'Painel de Controle': false, 'Logs de Auditoria': false, 'Backups': false, 'Configurações API': false },
        financeiro: { 'Ver Todo Fluxo': false, 'Aprovar Pagamentos': false, 'Relatórios Fiscais': false },
        pessoas: { 'Admissão/Demissão': false, 'Gerir Salários': false, 'Acesso a Dados Sensíveis': false, 'Avaliar Equipe': true, 'Aprovar Férias': true },
        academico: { 'Criar Cursos': false, 'Fechar Pautas': false },
        documentos: { 'Arquivos Sigilosos': false, 'Excluir Documentos': false, 'Ver Documentos Dept': true }
      }
    },
    {
      id: 3,
      nome: 'Colaboradores',
      descricao: 'Acesso padrão ao portal do funcionário.',
      icon: <FaUsers />,
      color: 'green',
      usersCount: 45,
      permissoes: ['Portal do Funcionário', 'Holerite Online'],
      config: {
        sistema: { 'Painel de Controle': false },
        financeiro: { 'Ver Holerite Próprio': true },
        pessoas: { 'Editar Perfil Pessoal': true, 'Solicitar Férias': true },
        academico: { 'Diário de Classe (Se Prof)': true },
        documentos: { 'Meus Documentos': true }
      }
    }
  ]);

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
          <p style={{color: '#64748b'}}>Definição estratégica de perfis e permissões</p>
        </div>
        <button className={styles.addRoleBtn}>
          <FaUserShield /> Novo Perfil
        </button>
      </div>

      <div className={styles.rolesGrid}>
        {grupos.map((grupo) => (
          <div key={grupo.id} className={`${styles.roleCard} ${styles[`border-${grupo.color}`]} card-modern`}>
            <div className={styles.cardHeader}>
               <div className={`${styles.iconBox} ${styles[`bg-${grupo.color}`]}`}>
                 {grupo.icon}
               </div>
               <div className={styles.userBadge}>
                 <FaUsers /> {grupo.usersCount}
               </div>
            </div>

            <h2 className={styles.roleName}>{grupo.nome}</h2>
            <p className={styles.roleDesc}>{grupo.descricao}</p>
            
            <div className={styles.permissionsPreview}>
               {grupo.permissoes.map((p, i) => (
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
                    onChange={e => setEditingGroup({...editingGroup, nome: e.target.value})}
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <input 
                    type="text" 
                    value={editingGroup.descricao}
                    onChange={e => setEditingGroup({...editingGroup, descricao: e.target.value})}
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
              </div>

              {/* Seção 2: Permissões Detalhadas */}
              <h3 className={styles.sectionDivider}>Permissões por Módulo</h3>
              
              <div className={styles.permissionsGrid}>
                {Object.entries(editingGroup.config).map(([category, perms]) => (
                  <div key={category} className={styles.moduleCard}>
                    <h4 className={styles.moduleTitle}>{category.toUpperCase()}</h4>
                    <div className={styles.togglesList}>
                      {Object.entries(perms).map(([key, value]) => (
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
               <button className={styles.btnDelete}>Excluir Perfil</button>
               <div className={styles.footerActions}>
                 <button className={styles.btnCancel} onClick={() => setEditingGroup(null)}>Cancelar</button>
                 <button className={styles.btnSave} onClick={() => {
                   setGrupos(grupos.map(g => g.id === editingGroup.id ? editingGroup : g));
                   setEditingGroup(null);
                 }}>
                   <FaSave /> Salvar Alterações
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
