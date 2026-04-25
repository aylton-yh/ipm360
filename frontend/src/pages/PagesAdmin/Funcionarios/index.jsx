import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaSearch, FaUserPlus, FaEllipsisV, FaEnvelope, FaPhone, FaEdit, FaTrash, FaExchangeAlt, FaTimes, FaChartPie } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Funcionarios.module.css';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/ConfirmModal';

export default function Funcionarios() {
  const navigate = useNavigate();
  const location = useLocation();
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [filtroDept, setFiltroDept] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [menuAberto, setMenuAberto] = useState(null); // ID do funcionário com menu aberto
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPerfEmployee, setSelectedPerfEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [perfFilter, setPerfFilter] = useState('Todos');
  const { employees, departments, removeEmployee, updateEmployee, addHistoryEvent, clearAllEmployees, history } = useContext(EmployeeContext);
  const { hasPermission, getApiUrl } = useContext(AuthContext);
  const menuRef = useRef(null);

  // Auto-open profile if requested via navigation
  useEffect(() => {
    if (location.state?.openProfileByName) {
      const target = employees.find(e => e.nome === location.state.openProfileByName);
      if (target) {
        setSelectedEmployee(target);
        // Limpar o state para não reabrir ao navegar
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, employees]);

  // Usando dados do Contexto
  const funcionarios = employees;

  // Filtragem Multi-critério
  const filtered = employees.filter(f => {
    const termo = termoPesquisa.toLowerCase();
    const batemBusca =
      f.nome.toLowerCase().includes(termo) ||
      (f.bi && f.bi.toLowerCase().includes(termo)) ||
      (f.telefone && f.telefone.includes(termo));

    const batemDept = filtroDept === '' || f.dept === filtroDept;
    const batemStatus = filtroStatus === '' || f.status === filtroStatus;
    return batemBusca && batemDept && batemStatus;
  });

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

  const handleStatusChange = async (func, nextStatus) => {
    const res = await updateEmployee(func.id, { ...func, status: nextStatus });
    
    if (res.success) {
      addHistoryEvent({
        data: new Date().toISOString(),
        evento: 'Mudança de Status',
        tipo: 'sistema',
        funcionario: func.nome,
        cargo: func.cargo,
        dept: func.dept,
        resultadoQuantitativo: '-',
        resultadoQualitativo: nextStatus,
        criterios: []
      });
      toast.success(`Status de ${func.nome} alterado para ${nextStatus}`);
    } else {
      toast.error('Erro ao alterar status: ' + res.message);
    }

    setMenuAberto(null);
  };

  return (
    <div className="page-container" onClick={() => setMenuAberto(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Funcionários</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Gerencie a equipe da sua empresa</p>
        </div>
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
          <select value={filtroDept} onChange={e => setFiltroDept(e.target.value)}>
            <option value="">Todos Departamentos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.nome}>{dept.nome}</option>
            ))}
          </select>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Férias">Férias</option>
            <option value="Suspenso">Suspenso</option>
          </select>
        </div>

        <div className={styles.headerActions}>
          {employees.length > 0 && hasPermission('funcionarios', 'Eliminar') && (
            <button className={styles.clearBtn} onClick={clearAllEmployees}>
              <FaTrash /> Limpar
            </button>
          )}
          {hasPermission('funcionarios', 'Cadastrar') && (
            <button
              className={styles.addButton}
              onClick={() => navigate('/cadastrar-funcionario')}
            >
              <FaUserPlus /> Cadastrar
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.length > 0 ? filtered.map(func => (
          <div key={func.id} className={`${styles.card} card-modern`}>
            {/* Status Bar */}
            <div className={`${styles.cardTopBar} ${styles[func.status.toLowerCase().replace('é', 'e')]}`}></div>

            <div className={styles.cardInfo}>
              <div className={styles.cardHeader}>
                <span className={`${styles.badge} ${styles[func.status.toLowerCase().replace('é', 'e')]}`}>{func.status}</span>

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
                      {hasPermission('funcionarios', 'Editar') && (
                        <button
                          className={styles.menuItem}
                          onClick={() => navigate('/cadastrar-funcionario', { state: { employee: func } })}
                        >
                          <FaEdit /> Editar
                        </button>
                      )}
                      <button
                        className={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerfEmployee(func);
                          setMenuAberto(null);
                        }}
                      >
                        <FaChartPie /> Ver Desempenho
                      </button>

                      <div className={styles.divider}></div>
                      <div className={styles.menuLabel}>Alterar Status para:</div>

                      {func.status !== 'Ativo' && (
                        <button className={styles.menuItem} onClick={() => handleStatusChange(func, 'Ativo')}>
                          <FaExchangeAlt /> Ativo
                        </button>
                      )}
                      {func.status !== 'Férias' && (
                        <button className={styles.menuItem} onClick={() => handleStatusChange(func, 'Férias')}>
                          <FaExchangeAlt /> Férias
                        </button>
                      )}
                      {func.status !== 'Suspenso' && (
                        <button className={styles.menuItem} onClick={() => handleStatusChange(func, 'Suspenso')}>
                          <FaExchangeAlt /> Suspenso
                        </button>
                      )}
                      {func.status !== 'Inativo' && (
                        <button className={styles.menuItem} onClick={() => handleStatusChange(func, 'Inativo')}>
                          <FaExchangeAlt /> Inativo
                        </button>
                      )}

                      <div className={styles.divider}></div>

                      {hasPermission('funcionarios', 'Eliminar') && (
                        <button
                          className={`${styles.menuItem} ${styles.delete}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmployeeToDelete(func);
                            setMenuAberto(null);
                          }}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.avatar}>
                {func.foto && typeof func.foto === 'string' && func.foto.length > 5 ? (
                  <img src={(func.foto.startsWith('data:image') || func.foto.startsWith('http')) ? func.foto : getApiUrl('/' + func.foto)} alt={func.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  getInitials(func.nome)
                )}
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
        )) : (
          <div className={styles.emptyState}>
            <p>Nenhum funcionário encontrado com os filtros atuais.</p>
          </div>
        )}
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
                {selectedEmployee.foto && typeof selectedEmployee.foto === 'string' && selectedEmployee.foto.length > 5 ? (
                  <img src={(selectedEmployee.foto.startsWith('data:image') || selectedEmployee.foto.startsWith('http')) ? selectedEmployee.foto : getApiUrl('/' + selectedEmployee.foto)} alt={selectedEmployee.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  getInitials(selectedEmployee.nome)
                )}
              </div>

              <h2 className={styles.modalTitle}>{selectedEmployee.nome}</h2>
              <span className={styles.modalSubtitle}>{selectedEmployee.cargo}</span>

              <div className={styles.modalTags}>
                <span className={styles.modalTag}>{selectedEmployee.dept}</span>
                <span className={styles.modalTag}>Admissão: {selectedEmployee.admissao || 'Não inf.'}</span>
                <span className={styles.modalTag}>ID: {selectedEmployee.id}</span>
                {selectedEmployee.num_agente && <span className={styles.modalTag}>Agente: {selectedEmployee.num_agente}</span>}
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoItem}>
                  <label>Email Corporativo</label>
                  <p>{selectedEmployee.email || '-'}</p>
                </div>

                {selectedEmployee.email_pessoal && (
                  <div className={styles.infoItem}>
                    <label>Email Pessoal</label>
                    <p>{selectedEmployee.email_pessoal}</p>
                  </div>
                )}

                <div className={styles.infoItem}>
                  <label>Telefone</label>
                  <p>{selectedEmployee.telefone || 'Não informado'}</p>
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
                  <label>Endereço</label>
                  <p>{selectedEmployee.endereco || 'Não informado'}</p>
                </div>

                <div className={styles.infoItem}>
                  <label>BI / Passaporte</label>
                  <p>{selectedEmployee.bi || '-'}</p>
                </div>

                <div className={styles.infoItem}>
                  <label>Data de Nascimento</label>
                  <p>{selectedEmployee.nascimento || '-'}</p>
                </div>

                <div className={styles.infoItem}>
                  <label>Gênero</label>
                  <p>{selectedEmployee.sexo || '-'}</p>
                </div>

                <div className={styles.infoItem}>
                  <label>Estado Civil</label>
                  <p>{selectedEmployee.estadoCivil || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DESEMPENHO */}
      {selectedPerfEmployee && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPerfEmployee(null)}>
          <div className={styles.perfModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedPerfEmployee(null)}>
              <FaTimes />
            </button>

            <div className={styles.perfHeader}>
              <h2>Desempenho de {selectedPerfEmployee.nome}</h2>
            </div>

            <div className={styles.perfBody}>
              <div className={styles.perfGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {(history
                      .filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id) && h.tipo === 'avaliacao')
                      .reduce((acc, curr) => acc + (curr.score || 0), 0) /
                      (history.filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id) && h.tipo === 'avaliacao').length || 1)
                    ).toFixed(1)} / 20
                  </span>
                  <span className={styles.statLabel}>Média Geral</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {history
                      .filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id))
                      .reduce((acc, curr) => acc + (curr.faltas || 0), 0)}
                  </span>
                  <span className={styles.statLabel}>Total de Faltas</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {history.filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id) && h.tipo === 'avaliacao').length}
                  </span>
                  <span className={styles.statLabel}>Avaliações Feitas</span>
                </div>
              </div>

              <div className={styles.historyTitle}>
                Histórico de Avaliações
                <select
                  value={perfFilter}
                  onChange={e => setPerfFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Todos">Todos os Períodos</option>
                  <option value="Diário">Diário</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div className={styles.historyList}>
                {history
                  .filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id) && h.tipo === 'avaliacao')
                  .filter(h => perfFilter === 'Todos' || h.periodo === perfFilter)
                  .map(h => (
                    <div key={h.id} className={styles.historyCard}>
                      <div className={styles.histMain}>
                        <span className={styles.histPeriod}>{h.periodo || 'Mensal'}</span>
                        <span className={styles.histDate}>{new Date(h.data || h.data_hora).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.histScore}>
                        <span className={styles.scoreVal}>{h.resultadoQuantitativo}</span>
                        <span className={styles.scoreQuali} style={{
                          color: h.resultadoQualitativo === 'Muito Bom' ? '#10b981' :
                            h.resultadoQualitativo === 'Bom' ? '#3b82f6' :
                              h.resultadoQualitativo === 'Razoável' ? '#f59e0b' : '#ef4444'
                        }}>{h.resultadoQualitativo}</span>
                        {h.faltas > 0 && <span className={styles.histFaltas}>{h.faltas} Faltas</span>}
                      </div>
                    </div>
                  ))}

                {history.filter(h => (h.funcionarioId === selectedPerfEmployee.id || h.id_funcionario === selectedPerfEmployee.id) && h.tipo === 'avaliacao' && (perfFilter === 'Todos' || h.periodo === perfFilter)).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nenhuma avaliação encontrada para este período.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!employeeToDelete}
        title="Remover Funcionário"
        message={`Tem certeza que deseja remover permanentemente o funcionário ${employeeToDelete?.nome}?`}
        onConfirm={() => {
          if (employeeToDelete) {
            removeEmployee(employeeToDelete.id);
            addHistoryEvent({
              data: new Date().toISOString(),
              evento: 'Desligamento',
              tipo: 'sistema',
              funcionario: employeeToDelete.nome,
              cargo: employeeToDelete.cargo,
              dept: employeeToDelete.dept,
              resultadoQuantitativo: '-',
              resultadoQualitativo: 'Removido',
              criterios: []
            });
            setEmployeeToDelete(null);
          }
        }}
        onClose={() => setEmployeeToDelete(null)}
      />
    </div>
  )
}
