import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { FaDownload, FaFilter, FaSearch, FaRegCalendarAlt, FaClipboardCheck, FaTrophy, FaUserEdit, FaExclamationCircle, FaTimes, FaUserTie, FaFilePdf, FaFileExcel, FaChevronDown, FaUserPlus, FaTrash } from 'react-icons/fa';
import styles from './Historicos.module.css';
import { useNavigate } from 'react-router-dom';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';

export default function Historicos() {
  const navigate = useNavigate();
  const { history, clearHistory, removeHistoryEvent } = useContext(EmployeeContext);
  const { adminHistory, currentUser, deleteAdminHistoryItem, clearAdminHistory } = useContext(AuthContext);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // Modified options below
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const exportRef = useRef(null);

  const historyData = useMemo(() => {
    // Mapear adminHistory para o formato do histórico de funcionários
    const formattedAdminHistory = adminHistory.map(h => ({
      id: `admin-${h.id}`,
      data: h.data,
      evento: h.evento,
      tipo: h.tipo,
      funcionario: h.nome,
      cargo: h.cargo || 'Administrador',
      dept: h.dept || 'Geral',
      resultadoQuantitativo: '-',
      resultadoQualitativo: h.status === 'pending' ? 'Pendente' : (h.status === 'approved' ? 'Aprovado' : 'Recusado'),
      adminData: h // Guardar dados extras se necessário
    }));

    return [...formattedAdminHistory, ...history].sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [history, adminHistory]);

  // Logic para filtrar os dados baseados no tempo e pesquisa
  const filteredHistory = historyData.filter(item => {
    const itemDate = new Date(item.data);
    const now = new Date();

    // Filtro de Tempo
    let passesTime = true;
    if (timeFilter === '24h') {
      const dayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      passesTime = itemDate >= dayAgo;
    } else if (timeFilter === '7d') {
      const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      passesTime = itemDate >= weekAgo;
    } else if (timeFilter === 'thisMonth') {
      passesTime = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === 'lastMonth') {
      const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      passesTime = itemDate.getMonth() === lastM.getMonth() && itemDate.getFullYear() === lastM.getFullYear();
    } else if (timeFilter === 'thisYear') {
      passesTime = itemDate.getFullYear() === now.getFullYear();
    }

    // Filtro de Pesquisa
    const searchLower = searchTerm.toLowerCase();
    const passesSearch =
      item.funcionario.toLowerCase().includes(searchLower) ||
      item.evento.toLowerCase().includes(searchLower) ||
      item.dept.toLowerCase().includes(searchLower);

    return passesTime && passesSearch;
  });

  // Sugestões de pesquisa (nomes únicos de funcionários ou eventos)
  const suggestions = Array.from(new Set([
    ...historyData.map(h => h.funcionario),
    ...historyData.map(h => h.evento)
  ])).filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 1).slice(0, 5);

  // Cálculos dinâmicos para os cards de resumo baseados no filtro ATUAL
  const totalEventosPeriodo = filteredHistory.length;
  const totalAvaliacoes = filteredHistory.filter(item => item.tipo === 'avaliacao').length;
  const totalPromocoes = filteredHistory.filter(item => item.tipo === 'promocao').length;
  const totalPendentes = filteredHistory.filter(item => item.resultadoQualitativo === 'Pendente').length;

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'avaliacao': return <FaClipboardCheck style={{ color: '#8b5cf6' }} />;
      case 'promocao': return <FaTrophy style={{ color: '#f59e0b' }} />;
      case 'feedback': return <FaExclamationCircle style={{ color: '#3b82f6' }} />;
      case 'admin_request': return <FaUserPlus style={{ color: '#10b981' }} />;
      default: return <FaUserEdit style={{ color: '#64748b' }} />;
    }
  };

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type) => {
    setShowExportMenu(false);
    setIsExporting(true);

    // Simulação de processamento profissional
    setTimeout(() => {
      setIsExporting(false);
      const periodLabel = timeFilter === 'all' ? 'Completo' : timeFilter.toUpperCase();
      alert(`RELATÓRIO GERADO COM SUCESSO!\n\nTipo: ${type}\nPeríodo: ${periodLabel}\nTotal de Registros: ${filteredHistory.length}\nAvaliações: ${totalAvaliacoes}\n\nO arquivo "Historico_IPM360_${periodLabel}. ${type.toLowerCase()}" foi salvo na sua pasta de Downloads.`);
    }, 2000);
  };

  const handleOpenFullProfile = () => {
    // Navegar para a lista de funcionários e solicitar abertura do perfil
    navigate('/funcionarios', { state: { openProfileByName: selectedItem.funcionario } });
  };

  const getTimeLabel = (filter) => {
    switch (filter) {
      case '24h': return 'Últimas 24H';
      case '7d': return 'Últimos 7 Dias';
      case 'thisMonth': return 'Este Mês';
      case 'lastMonth': return 'Mês Passado';
      case 'thisYear': return 'Todo o Ano';
      default: return 'Todo Histórico';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Histórico de Eventos</h1>
          <p style={{ color: '#64748b' }}>Monitoramento de atividades e ciclos de vida</p>
        </div>

        {/* Botão Exportar com Dropdown */}
        <div className={styles.exportWrapper} ref={exportRef}>
          <button
            className={`${styles.exportBtn} ${showExportMenu ? styles.active : ''}`}
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <FaDownload /> Exportar Relatório <FaChevronDown size={12} style={{ marginLeft: 5 }} />
          </button>

          {showExportMenu && (
            <div className={styles.exportDropdown}>
              <button onClick={() => handleExport('PDF')} className={styles.exportOption}>
                <FaFilePdf style={{ color: '#ef4444' }} /> PDF
              </button>
              <button onClick={() => handleExport('Excel')} className={styles.exportOption}>
                <FaFileExcel style={{ color: '#10b981' }} /> Excel
              </button>
            </div>
          )}
        </div>

        {currentUser?.role === 'global_admin' && (
          <button
            className={styles.clearAllBtn}
            onClick={() => {
              if (window.confirm('Tem certeza que deseja apagar TODO o histórico visualizado nesta tela?')) {
                clearAdminHistory(true); // Limpa pedidos de admin (adminHistory)
                clearHistory(true);      // Limpa eventos de funcionários (history)
                alert('O histórico foi removido com sucesso!');
              }
            }}
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
          >
            <FaTrash size={14} /> Limpar Tudo
          </button>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Eventos ({getTimeLabel(timeFilter)})</span>
          <strong className={styles.statValue}>{totalEventosPeriodo}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avaliações</span>
          <strong className={styles.statValue}>{totalAvaliacoes}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Promoções</span>
          <strong className={styles.statValue}>{totalPromocoes}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pendentes</span>
          <strong className={styles.statValue} style={{ color: '#f59e0b' }}>{totalPendentes}</strong>
        </div>
      </div>

      <div className={`${styles.tableCard} card-modern`}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox} ref={searchRef}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por funcionário, evento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className={styles.suggestionItem}
                    onClick={() => {
                      setSearchTerm(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.periodSelector}>
              <span className={styles.periodLabel}><FaRegCalendarAlt /> Período:</span>
              <select
                className={styles.timeSelect}
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">Todo Histórico</option>
                <option value="24h">Últimas 24H</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="thisMonth">Este Mês</option>
                <option value="lastMonth">Mês Passado</option>
                <option value="thisYear">Todo Ano</option>
              </select>
            </div>
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
              {filteredHistory.map((item) => (
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
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.deptTag}>{item.dept}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${selectedItem?.resultadoQualitativo === 'Pendente' ? styles.pending : styles.success}`}>
                      {item.resultadoQualitativo} ({item.resultadoQuantitativo})
                    </span>
                  </td>
                  <td align="right">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button className={styles.detailsBtn} onClick={() => setSelectedItem(item)}>Ver Detalhes</button>
                      {currentUser?.role === 'global_admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Excluir este registro permanentemente?')) {
                              if (item.id.toString().startsWith('admin-')) {
                                deleteAdminHistoryItem(item.adminData.id);
                              } else {
                                removeHistoryEvent(item.id);
                              }
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                          title="Excluir Registro"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
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

              <h2 className={styles.modalTitle} style={{ textAlign: 'center' }}>João Silva</h2>
              <span className={styles.modalSubtitle} style={{ textAlign: 'center', display: 'block' }}>Desenvolvedor Senior</span>

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
                  <p style={{ color: '#10b981' }}>Ativo</p>
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
