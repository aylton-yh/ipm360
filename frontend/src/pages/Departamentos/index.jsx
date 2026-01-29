import React, { useState, useEffect, useRef } from 'react';
import { FaUserTie, FaChalkboardTeacher, FaBroom, FaLaptopCode, FaPlus, FaEllipsisH, FaEdit, FaTrash } from 'react-icons/fa';
import styles from './Departamentos.module.css';

export default function Departamentos() {
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);

  const depts = [
    { 
      id: 1, 
      nome: 'Administração', 
      head: 'Dr. António Manuel', 
      staff: 15, 
      color: 'blue',
      icon: <FaUserTie />,
      seccoes: ['Secretaria Geral', 'Direção', 'Recursos Humanos', 'Finanças']
    },
    { 
      id: 2, 
      nome: 'Docência', 
      head: 'Prof. Maria do Carmo', 
      staff: 42, 
      color: 'green',
      icon: <FaChalkboardTeacher />,
      seccoes: ['Coordenação Pedagógica', 'Ensino Médio', 'Ensino Fundamental', 'Atividades Extra']
    },
    { 
      id: 3, 
      nome: 'Serviços Gerais', 
      head: 'Sr. João Pedro', 
      staff: 28, 
      color: 'orange',
      icon: <FaBroom />,
      seccoes: ['Limpeza e Higiene', 'Segurança Patrimonial', 'Manutenção', 'Jardinagem']
    },
    { 
      id: 4, 
      nome: 'TIC', 
      head: 'Eng. Carlos Silva', 
      staff: 8, 
      color: 'purple',
      icon: <FaLaptopCode />,
      seccoes: ['Infraestrutura', 'Desenvolvimento de Sistemas', 'Suporte Técnico', 'Laboratórios']
    },
  ];

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuAberto(menuAberto === id ? null : id);
  };

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
          <h1 className="page-title">Departamentos</h1>
          <p style={{color: '#64748b'}}>Gestão estrutural da organização</p>
        </div>
        <button className={styles.addButton}>
          <FaPlus /> Novo Departamento
        </button>
      </div>

      <div className={styles.grid}>
        {depts.map(dept => (
          <div key={dept.id} className={`${styles.deptCard} ${styles[`border-${dept.color}`]} card-modern`}>
             <div className={styles.cardHeader}>
               <div className={`${styles.iconBox} ${styles[`bg-${dept.color}`]}`}>
                 {dept.icon}
               </div>
               
               <div className={styles.menuContainer}>
                 <button 
                   className={`${styles.moreBtn} ${menuAberto === dept.id ? styles.active : ''}`}
                   onClick={(e) => toggleMenu(dept.id, e)}
                 >
                   <FaEllipsisH />
                 </button>
                 
                 {menuAberto === dept.id && (
                   <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                     <button className={styles.menuItem}><FaEdit /> Editar</button>
                     <div className={styles.divider}></div>
                     <button className={`${styles.menuItem} ${styles.delete}`}><FaTrash /> Eliminar</button>
                   </div>
                 )}
               </div>
             </div>

             <h2 className={styles.deptName}>{dept.nome}</h2>
             
             <div className={styles.statRow}>
               <div>
                 <span className={styles.label}>Gestor</span>
                 <p className={styles.value}>{dept.head}</p>
               </div>
               <div style={{textAlign: 'right'}}>
                 <span className={styles.label}>Equipe</span>
                 <p className={styles.value}>{dept.staff} Colaboradores</p>
               </div>
             </div>

             <div className={styles.divider}></div>

             <div className={styles.sectionArea}>
               <span className={styles.sectionTitle}>Seções & Áreas</span>
               <div className={styles.tags}>
                 {dept.seccoes.map((sec, idx) => (
                   <span key={idx} className={styles.tag}>{sec}</span>
                 ))}
               </div>
             </div>
             
             {/* Footer removido conforme solicitado */}
          </div>
        ))}
      </div>
    </div>
  )
}
