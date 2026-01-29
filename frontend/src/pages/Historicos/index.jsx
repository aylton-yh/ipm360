import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaFilter, FaSearch, FaRegCalendarAlt, FaClipboardCheck, FaTrophy, FaUserEdit, FaExclamationCircle, FaTimes, FaUserTie, FaFilePdf, FaFileExcel, FaChevronDown } from 'react-icons/fa';
import styles from './Historicos.module.css';

export default function Historicos() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  const historyData = [
    { id: 1, data: '2025-01-20', evento: 'Avaliação de Desempenho', tipo: 'avaliacao', funcionario: 'João Silva', cargo: 'Técnico de Suporte', dept: 'TIC', resultado: '18/20 - Muito Bom' },
    { id: 2, data: '2025-01-18', evento: 'Promoção de Carreira', tipo: 'promocao', funcionario: 'Maria Santos', cargo: 'Professor Titular', dept: 'Docência', resultado: 'Aprovado' },
    { id: 3, data: '2025-01-15', evento: 'Feedback Pedagógico', tipo: 'feedback', funcionario: 'Pedro Costa', cargo: 'Coordenador', dept: 'Docência', resultado: 'Pendente' },
    { id: 4, data: '2025-01-10', evento: 'Manutenção Preventiva', tipo: 'sistema', funcionario: 'Ana Lima', cargo: 'Zeladora', dept: 'Serviços Gerais', resultado: 'Concluído' },
    { id: 5, data: '2025-01-05', evento: 'Fechamento Contábil', tipo: 'sistema', funcionario: 'Carlos Ferreira', cargo: 'Tesoureiro', dept: 'Administração', resultado: 'Concluído' },
  ];

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'avaliacao': return <FaClipboardCheck style={{color: '#8b5cf6'}} />;
      case 'promocao': return <FaTrophy style={{color: '#f59e0b'}} />;
      case 'feedback': return <FaExclamationCircle style={{color: '#3b82f6'}} />;
      default: return <FaUserEdit style={{color: '#64748b'}} />;
    }
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type) => {
    setShowExportMenu(false);
    alert(`Exportando Relatório em ${type}...`);
  };

  const handleOpenFullProfile = () => {
    setSelectedItem(null); 
    setShowFullProfile(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Histórico de Eventos</h1>
          <p style={{color: '#64748b'}}>Monitoramento de atividades e ciclos de vida</p>
        </div>
        
        {/* Botão Exportar com Dropdown */}
        <div className={styles.exportWrapper} ref={exportRef}>
          <button 
            className={`${styles.exportBtn} ${showExportMenu ? styles.active : ''}`}
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <FaDownload /> Exportar Relatório <FaChevronDown size={12} style={{marginLeft: 5}}/>
          </button>
          
          {showExportMenu && (
            <div className={styles.exportDropdown}>
              <button onClick={() => handleExport('PDF')} className={styles.exportOption}>
                <FaFilePdf style={{color: '#ef4444'}} /> PDF
              </button>
              <button onClick={() => handleExport('Excel')} className={styles.exportOption}>
                <FaFileExcel style={{color: '#10b981'}} /> Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className={styles.statsGrid}>
         <div className={styles.statCard}>
            <span className={styles.statLabel}>Eventos (Mês)</span>
            <strong className={styles.statValue}>24</strong>
         </div>
         <div className={styles.statCard}>
            <span className={styles.statLabel}>Avaliações</span>
            <strong className={styles.statValue}>12</strong>
         </div>
         <div className={styles.statCard}>
            <span className={styles.statLabel}>Promoções</span>
            <strong className={styles.statValue}>3</strong>
         </div>
         <div className={styles.statCard}>
            <span className={styles.statLabel}>Pendentes</span>
            <strong className={styles.statValue} style={{color: '#f59e0b'}}>5</strong>
         </div>
      </div>

      <div className={`${styles.tableCard} card-modern`}>
        <div className={styles.toolbar}>
           <div className={styles.searchBox}>
             <FaSearch className={styles.searchIcon} />
             <input type="text" placeholder="Buscar por funcionário, evento..." />
           </div>
           
           <div className={styles.filterGroup}>
             <button className={styles.filterBtn}><FaRegCalendarAlt /> Data</button>
             <button className={styles.filterBtn}><FaFilter /> Tipo</button>
           </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th width="150">Data</th>
                <th>Evento</th>
                <th>Funcionário</th>
                <th>Departamento</th>
                <th>Resultado / Status</th>
                <th align="right"></th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item) => (
                <tr key={item.id}>
                  <td className={styles.dateCell}>
                    {new Date(item.data).toLocaleDateString()}
                  </td>
                  <td>
                    <div className={styles.eventCell}>
                      <div className={styles.iconBg}>{getIcon(item.tipo)}</div>
                      <span className={styles.eventName}>{item.evento}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>{item.funcionario.charAt(0)}</div>
                      <div>
                        <span className={styles.userName}>{item.funcionario}</span>
                        <div style={{fontSize: '11px', color: '#64748b'}}>{item.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.deptTag}>{item.dept}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.resultado === 'Pendente' ? styles.pending : styles.success}`}>
                      {item.resultado}
                    </span>
                  </td>
                  <td align="right">
                    <button className={styles.detailsBtn} onClick={() => setSelectedItem(item)}>Ver Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes Simples */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
              <FaTimes />
            </button>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>{selectedItem.funcionario.charAt(0)}</div>
              <div>
                <h2 className={styles.modalTitle}>{selectedItem.funcionario}</h2>
                <span className={styles.modalSubtitle}>{selectedItem.cargo}</span>
              </div>
            </div>

            <div className={styles.modalBody}>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Departamento</span>
                 <span className={styles.infoValue}>{selectedItem.dept}</span>
               </div>
               
               <div className={styles.modalDivider}></div>
               
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Evento</span>
                 <span className={styles.infoValue}>{selectedItem.evento}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Data</span>
                 <span className={styles.infoValue}>{new Date(selectedItem.data).toLocaleDateString()}</span>
               </div>
               <div className={styles.infoRow}>
                 <span className={styles.infoLabel}>Resultado</span>
                 <span className={`${styles.statusBadge} ${selectedItem.resultado === 'Pendente' ? styles.pending : styles.success}`}>
                   {selectedItem.resultado}
                 </span>
               </div>
            </div>
            
            <div className={styles.modalFooter}>
               <button className={styles.btnAction} onClick={handleOpenFullProfile}>
                 <FaUserTie /> Perfil Completo
               </button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Perfil Completo */}
      {showFullProfile && (
        <div className={styles.modalOverlayFull} onClick={() => setShowFullProfile(false)}>
          <div className={styles.modalContentFull} onClick={e => e.stopPropagation()}>
             <button className={styles.closeBtn} onClick={() => setShowFullProfile(false)}>
               <FaTimes />
             </button>

             <div className={styles.modalHeaderFull}></div>

             <div className={styles.modalBodyFull}>
                {/* Avatar Grande */}
                <div className={styles.largeAvatar}>
                  J
                </div>

                <h2 className={styles.modalTitle} style={{textAlign: 'center'}}>João Silva</h2>
                <span className={styles.modalSubtitle} style={{textAlign: 'center', display: 'block'}}>Desenvolvedor Senior</span>

                <div className={styles.modalTags}>
                   <span className={styles.modalTag}>TI</span>
                   <span className={styles.modalTag}>Admitido em 2023</span>
                   <span className={styles.modalTag}>ID: 1</span>
                </div>

                <div className={styles.infoSection}>
                   <div className={styles.infoItem}>
                     <label>Email Corporativo</label>
                     <p>joao@ipm360.com</p>
                   </div>
                   <div className={styles.infoItem}>
                     <label>Telefone</label>
                     <p>+244 923 000 000</p>
                   </div>
                   <div className={styles.infoItem}>
                     <label>Status Atual</label>
                     <p style={{color: '#10b981'}}>Ativo</p>
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
