import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaCalendarAlt, FaCheck, FaTimes,
    FaUsers, FaFilter, FaClock, FaHistory, FaBuilding, FaUserCheck
} from 'react-icons/fa';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Presenca.module.css';

const Presenca = () => {
    const { employees, departments: contextDepartments, getApiUrl } = useContext(EmployeeContext);
    const { token } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('Todos');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [presencasHoje, setPresencasHoje] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [detailedHistory, setDetailedHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalYear, setModalYear] = useState(new Date().getFullYear());
    const [modalMonth, setModalMonth] = useState('Todos');

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const stats = useMemo(() => {
        const total = employees.length;
        const presentes = Object.values(presencasHoje).filter(p => p === 'Presente').length;
        const faltas = Object.values(presencasHoje).filter(p => p === 'Faltou').length;
        return { total, presentes, faltas };
    }, [employees, presencasHoje]);

    useEffect(() => {
        if (token) {
            fetchPresencasHoje();
        }
    }, [token, employees]);

    const fetchPresencasHoje = async () => {
        try {
            const res = await axios.get(getApiUrl('/api/presencas/hoje'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mapped = {};
            res.data.forEach(p => {
                mapped[p.id_funcionario] = p.status;
            });
            setPresencasHoje(mapped);
        } catch (error) {
            console.error('Erro ao buscar presenças hoje:', error);
        }
    };

    const handleMarcar = async (id, status) => {
        const emp = employees.find(e => e.id === id);
        
        if (emp && emp.status !== 'Ativo') {
            alert(`Bloqueio de Registro: O funcionário ${emp.nome} está com o status "${emp.status}". 
Não é permitido registrar presenças ou faltas para funcionários em Férias, Suspensos ou Inativos. 
Para realizar esta ação, o status do funcionário deve ser alterado para "Ativo" na lista de funcionários.`);
            return;
        }

        try {
            await axios.post(getApiUrl('/api/presencas'),
                { id_funcionario: id, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPresencasHoje(prev => ({ ...prev, [id]: status }));
            alert('Presença registrada com sucesso!');
        } catch (error) {
            const msg = error.response?.data?.error || 'Erro ao registrar presença';
            alert(msg);
            console.error('Erro ao registar presença:', error);
        }
    };

    const openHistory = async (employee) => {
        setSelectedEmployee(employee);
        setLoading(true);
        setShowModal(true);
        setModalMonth('Todos');
        setModalYear(new Date().getFullYear());
        try {
            const res = await axios.get(getApiUrl(`/api/presencas/historico/${employee.id}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDetailedHistory(res.data);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        // Campo de pesquisa
        const matchesSearch = (emp.nome || "").toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro de Departamento
        const matchesDept = filterDept === 'Todos' || emp.dept === filterDept;

        // Filtro de Status
        const matchesStatus = filterStatus === 'Todos' || emp.status === filterStatus;

        return matchesSearch && matchesDept && matchesStatus;
    });

    const getYearsOfService = (admissao) => {
        const startYear = admissao ? new Date(admissao).getFullYear() : new Date().getFullYear();
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= startYear; y--) {
            years.push(y);
        }
        return years;
    };

    const filteredHistory = useMemo(() => {
        return detailedHistory.filter(h => {
            const d = new Date(h.data_hora);
            const matchesYear = d.getFullYear() === parseInt(modalYear);
            const matchesMonth = modalMonth === 'Todos' || d.getMonth() === months.indexOf(modalMonth);
            return matchesYear && matchesMonth;
        });
    }, [detailedHistory, modalYear, modalMonth]);

    const modalStats = useMemo(() => {
        const faltas = filteredHistory.filter(h => h.status === 'Faltou').length;
        const presencas = filteredHistory.filter(h => h.status === 'Presente').length;
        return { faltas, presencas };
    }, [filteredHistory]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <h2>Gestão de Presenças</h2>
                </div>
                <div className={styles.dateBadge}>
                    <FaCalendarAlt /> {new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterItem}>
                    <label><FaBuilding /> Departamento</label>
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                    >
                        <option value="Todos">Todos Departamentos</option>
                        {contextDepartments.map(dept => (
                            <option key={dept.id} value={dept.nome}>
                                {dept.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterItem}>
                    <label><FaUserCheck /> Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Todos">Todos os Status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Férias">Férias</option>
                        <option value="Suspenso">Suspenso</option>
                    </select>
                </div>
            </div>

            <div className={styles.employeeGrid}>
                {filteredEmployees.map(emp => {
                    const todayStatus = presencasHoje[emp.id];

                    return (
                        <motion.div
                            key={emp.id}
                            className={styles.employeeCard}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.cardTop}>
                                {emp.foto ? (
                                    <img src={emp.foto} alt={emp.nome} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{(emp.nome || "?").charAt(0)}</div>
                                )}
                                <div className={styles.info}>
                                    <h4>{emp.nome}</h4>
                                    <span>{emp.cargo || 'Funcionário'} • {emp.dept}</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btnPresente} ${todayStatus === 'Presente' ? styles.activePresenca : ''}`}
                                    onClick={() => handleMarcar(emp.id, 'Presente')}
                                    disabled={!!todayStatus}
                                    title={todayStatus ? `Já registrado hoje: ${todayStatus}` : "Marcar Presente"}
                                >
                                    <FaCheck /> Presente
                                </button>
                                <button
                                    className={`${styles.btnFaltou} ${todayStatus === 'Faltou' ? styles.activeFalta : ''}`}
                                    onClick={() => handleMarcar(emp.id, 'Faltou')}
                                    disabled={!!todayStatus}
                                    title={todayStatus ? `Já registrado hoje: ${todayStatus}` : "Marcar Falta"}
                                >
                                    <FaTimes /> Faltou
                                </button>
                            </div>

                            <div className={styles.historySection}>
                                <button className={styles.btnHistory} onClick={() => openHistory(emp)}>
                                    <FaHistory /> Ver Histórico Detalhado
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <motion.div
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3>Histórico: {selectedEmployee?.nome_completo || selectedEmployee?.nome}</h3>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>
                            <div className={styles.modalBody}>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando histórico...</div>
                                ) : (
                                    <>
                                        <div className={styles.modalFilters}>
                                            <div className={styles.filterGroup}>
                                                <label>Filtrar por Ano:</label>
                                                <select value={modalYear} onChange={(e) => setModalYear(e.target.value)}>
                                                    {getYearsOfService(selectedEmployee?.admissao || selectedEmployee?.data_admissao).map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.filterGroup}>
                                                <label>Filtrar por Mês:</label>
                                                <select value={modalMonth} onChange={(e) => setModalMonth(e.target.value)}>
                                                    <option value="Todos">Todos os Meses</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.historySummary}>
                                            <div className={styles.summaryItem}>
                                                <strong className={styles.totalFaltas}>{detailedHistory.filter(p => p.status === 'Faltou').length}</strong>
                                                <label>Total de Faltas</label>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <strong className={styles.textFaltou}>{modalStats.faltas}</strong>
                                                <label>Faltas no Filtro</label>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <strong className={styles.textPresente}>{modalStats.presencas}</strong>
                                                <label>Presenças no Filtro</label>
                                            </div>
                                        </div>

                                        <div className={styles.historyList}>
                                            {filteredHistory.length === 0 ? (
                                                <div className={styles.emptyHistory}>
                                                    <span style={{ fontSize: '2rem' }}>📂</span>
                                                    <p>Nenhum registro encontrado para este período.</p>
                                                </div>
                                            ) : (
                                                filteredHistory.map(h => (
                                                    <div key={h.id_presenca} className={styles.historyItem}>
                                                        <div className={styles.historyDate}>
                                                            <div className={styles.dateLabel}>
                                                                <FaCalendarAlt size={12} />
                                                                <strong>{new Date(h.data_hora).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                                                            </div>
                                                            <div className={styles.timeLabel}>
                                                                <FaClock size={12} />
                                                                <span>{new Date(h.data_hora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.statusBadge} ${h.status === 'Presente' ? styles.statusPresente : styles.statusFaltou}`}>
                                                            {h.status === 'Presente' ? <FaCheck /> : <FaTimes />}
                                                            {h.status}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Presenca;
