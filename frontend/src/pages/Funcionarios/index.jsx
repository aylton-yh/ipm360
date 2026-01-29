import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUserPlus, FaEllipsisV, FaEnvelope, FaPhone, FaEdit, FaTrash, FaExchangeAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './Funcionarios.module.css';

export default function Funcionarios() {
  const navigate = useNavigate();
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [menuAberto, setMenuAberto] = useState(null); // ID do funcionário com menu aberto
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const menuRef = useRef(null);
  
  // Mock de funcionários
  const funcionarios = [
    { id: 1, nome: 'João Silva', cargo: 'Desenvolvedor Senior', dept: 'TI', email: 'joao@ipm360.com', status: 'Ativo' },
    { id: 2, nome: 'Maria Santos', cargo: 'Gerente de RH', dept: 'Recursos Humanos', email: 'maria@ipm360.com', status: 'Ativo' },
    { id: 3, nome: 'Pedro Costa', cargo: 'Analista Financeiro', dept: 'Financeiro', email: 'pedro@ipm360.com', status: 'Ferias' },
    { id: 4, nome: 'Ana Lima', cargo: 'Designer UX', dept: 'Marketing', email: 'ana@ipm360.com', status: 'Ativo' },
    { id: 5, nome: 'Carlos Ferreira', cargo: 'DevOps', dept: 'TI', email: 'carlos@ipm360.com', status: 'Inativo' },
    { id: 6, nome: 'Sofia Gomes', cargo: 'Assistente Administrativo', dept: 'Admin', email: 'sofia@ipm360.com', status: 'Ativo' },
  ];

  const filtered = funcionarios.filter(f => f.nome.toLowerCase().includes(termoPesquisa.toLowerCase()));

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuAberto(menuAberto === id ? null : id);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="page-container" onClick={() => setMenuAberto(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Funcionários</h1>
          <p style={{color: '#64748b', marginTop: '5px'}}>Gerencie a equipe da sua empresa</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => navigate('/cadastrar-funcionario')}
        >
          <FaUserPlus /> Novo Funcionário
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar funcionários..." 
            value={termoPesquisa}
            onChange={e => setTermoPesquisa(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
           <select><option>Todos Departamentos</option></select>
           <select><option>Status</option></select>
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map(func => (
          <div key={func.id} className={`${styles.card} card-modern`}>
             {/* Borda superior colorida baseada no status */}
             <div className={`${styles.cardTopBar} ${styles[func.status.toLowerCase()]}`}></div>

             <div className={styles.cardInfo}>
               <div className={styles.cardHeader}>
                 <span className={`${styles.badge} ${styles[func.status.toLowerCase()]}`}>{func.status}</span>
                 
                 <div className={styles.menuContainer}>
                   <button 
                     className={`${styles.moreBtn} ${menuAberto === func.id ? styles.active : ''}`}
                     onClick={(e) => toggleMenu(func.id, e)}
                   >
                     {menuAberto === func.id ? <FaTimes /> : <FaEllipsisV />}
                   </button>
                   
                   {/* Dropdown Menu */}
                   {menuAberto === func.id && (
                     <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                       <button className={styles.menuItem}><FaEdit /> Editar</button>
                       <button className={styles.menuItem}><FaExchangeAlt /> Mudar Status</button>
                       <div className={styles.divider}></div>
                       <button className={`${styles.menuItem} ${styles.delete}`}><FaTrash /> Eliminar</button>
                     </div>
                   )}
                 </div>
               </div>
               
               <div className={styles.avatar}>
                 {getInitials(func.nome)}
               </div>
               
               <h3>{func.nome}</h3>
               <p className={styles.role}>{func.cargo}</p>
               <p className={styles.dept}>{func.dept}</p>
               
               <div className={styles.contacts}>
                 <a href={`mailto:${func.email}`} title="Email"><FaEnvelope /></a>
                 <a href="#" title="Ligar"><FaPhone /></a>
               </div>
             </div>
             
             <div className={styles.cardFooter}>
               <button 
                 className={styles.profileBtn}
                 onClick={() => setSelectedEmployee(func)}
               >
                 Ver Perfil Completo
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* MODAL PERFIL COMPLETO */}
      {selectedEmployee && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEmployee(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
             <button className={styles.closeBtn} onClick={() => setSelectedEmployee(null)}>
               <FaTimes />
             </button>

             <div className={styles.modalHeader}></div>

             <div className={styles.modalBody}>
                {/* Avatar Grande */}
                <div className={styles.largeAvatar}>
                  {getInitials(selectedEmployee.nome)}
                </div>

                <h2 className={styles.modalTitle}>{selectedEmployee.nome}</h2>
                <span className={styles.modalSubtitle}>{selectedEmployee.cargo}</span>

                <div className={styles.modalTags}>
                   <span className={styles.modalTag}>{selectedEmployee.dept}</span>
                   <span className={styles.modalTag}>Admitido em 2023</span>
                   <span className={styles.modalTag}>ID: {selectedEmployee.id}</span>
                </div>

                <div className={styles.infoSection}>
                   <div className={styles.infoItem}>
                     <label>Email Corporativo</label>
                     <p>{selectedEmployee.email}</p>
                   </div>
                   <div className={styles.infoItem}>
                     <label>Telefone</label>
                     <p>+244 923 000 000</p>
                   </div>
                   <div className={styles.infoItem}>
                     <label>Status Atual</label>
                     <p style={{
                       color: selectedEmployee.status === 'Ativo' ? '#10b981' : 
                              selectedEmployee.status === 'Inativo' ? '#ef4444' : '#f59e0b'
                     }}>
                       {selectedEmployee.status}
                     </p>
                   </div>
                   <div className={styles.infoItem}>
                     <label>Localização</label>
                     <p>Luanda, Angola</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
