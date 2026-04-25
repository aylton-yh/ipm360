import React, { useState, useContext, useEffect } from 'react';
import { FaTrophy, FaUserTie, FaBuilding, FaArrowRight, FaTimes, FaSave, FaSearch, FaArrowUp, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Promocoes.module.css';

export default function Promocoes() {
    const { employees, promoteEmployee, departments } = useContext(EmployeeContext);
    const { hasPermission, getApiUrl } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Estados para a nova promoção
    const [newDeptId, setNewDeptId] = useState('');
    const [newCargoId, setNewCargoId] = useState('');
    const [motivo, setMotivo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Quando selecionar um funcionário, inicializar os valores atuais
    useEffect(() => {
        if (selectedEmployee) {
            const currentDept = departments.find(d => d.nome === selectedEmployee.dept);
            setNewDeptId(currentDept?.id || '');
            
            // Tentar achar o ID do cargo atual
            if (currentDept) {
                const currentCargo = currentDept.seccoes.find(s => s.nome === selectedEmployee.cargo);
                setNewCargoId(currentCargo?.id || '');
            }
            setMotivo('');
        }
    }, [selectedEmployee, departments]);

    // Filtrar cargos baseados no departamento selecionado
    const availableCargos = departments.find(d => Number(d.id) === Number(newDeptId))?.seccoes || [];

    // Agrupar funcionários por departamento para a lista lateral
    const employeesByDept = departments.map(dept => {
        return {
            ...dept,
            staffMembers: employees.filter(emp => emp.dept === dept.nome &&
                (emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.cargo.toLowerCase().includes(searchTerm.toLowerCase())))
        };
    }).filter(dept => dept.staffMembers.length > 0);

    const handlePromoteSubmit = async () => {
        if (!newCargoId) return alert('Por favor, selecione o novo cargo.');
        
        setIsSubmitting(true);
        const res = await promoteEmployee(selectedEmployee.id, newCargoId, motivo);
        setIsSubmitting(false);

        if (res.success) {
            alert(`Movimentação de ${selectedEmployee.nome} realizada com sucesso!`);
            setSelectedEmployee(null);
        } else {
            alert(res.message);
        }
    };

    if (!hasPermission('funcionarios', 'Editar')) {
        return (
            <div className="page-container">
                <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
                    <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
                    <p>Você não tem permissão para gerenciar promoções de funcionários.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className={styles.headerInfo}>
                    <h1 className="page-title">Plano de Promoções & Carreira</h1>
                    <p>Gerencie progressões, transferências e o crescimento profissional da sua equipa.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.deptGrid}>
                {employeesByDept.length === 0 ? (
                    <div className={styles.noResults}>
                        <FaSearch size={40} />
                        <p>Nenhum funcionário encontrado para os termos pesquisados.</p>
                    </div>
                ) : (
                    employeesByDept.map(dept => (
                        <div key={dept.id} className={styles.deptCard}>
                            <div className={styles.deptHeader} style={{ borderLeftColor: dept.color }}>
                                <div className={styles.deptIcon} style={{ color: dept.color }}>
                                    <FaBuilding />
                                </div>
                                <div className={styles.deptInfo}>
                                    <h3 className={styles.deptName}>{dept.nome}</h3>
                                    <span className={styles.deptCount}>{dept.staffMembers.length} Funcionários</span>
                                </div>
                            </div>

                            <div className={styles.employeeList}>
                                {dept.staffMembers.map((emp, idx) => (
                                    <motion.div
                                        key={emp.id}
                                        className={styles.employeeItem}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className={styles.empMain}>
                                            <div className={styles.avatar}>
                                                {emp.foto && typeof emp.foto === 'string' && emp.foto.length > 5 ? (
                                                    <img src={(emp.foto.startsWith('data:image') || emp.foto.startsWith('http')) ? emp.foto : getApiUrl('/' + emp.foto)} alt={emp.nome} />
                                                ) : (
                                                    emp.nome.charAt(0)
                                                )}
                                            </div>
                                            <div className={styles.empDetails}>
                                                <span className={styles.empName}>{emp.nome}</span>
                                                <span className={styles.empRole}>{emp.cargo}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.promoteBtn}
                                            onClick={() => setSelectedEmployee(emp)}
                                        >
                                            <FaArrowUp /> Promover
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedEmployee && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedEmployee(null)}>
                        <motion.div
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        >
                            <div className={styles.modalHeaderModern}>
                                <div className={styles.headerTitleArea}>
                                    <div className={styles.iconBadge}><FaExchangeAlt /></div>
                                    <div>
                                        <h2>Progressão de Carreira</h2>
                                        <p>Atualize o cargo ou departamento de <strong>{selectedEmployee.nome}</strong></p>
                                    </div>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setSelectedEmployee(null)}><FaTimes /></button>
                            </div>

                            <div className={styles.modalBodyModern}>
                                <div className={styles.currentInfoCard}>
                                    <div className={styles.infoGroup}>
                                        <label>Situacao Atual</label>
                                        <div className={styles.infoValues}>
                                            <span><FaBuilding /> {selectedEmployee.dept}</span>
                                            <span className={styles.separator}>|</span>
                                            <span><FaUserTie /> {selectedEmployee.cargo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Novo Departamento</label>
                                        <div className={styles.selectWrapper}>
                                            <FaBuilding className={styles.inputIcon} />
                                            <select 
                                                value={newDeptId} 
                                                onChange={e => {
                                                    setNewDeptId(e.target.value);
                                                    setNewCargoId(''); // Reset cargo ao mudar dept
                                                }}
                                            >
                                                <option value="">Selecione o Departamento...</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Novo Cargo / Função</label>
                                        <div className={styles.selectWrapper}>
                                            <FaTrophy className={styles.inputIcon} />
                                            <select 
                                                value={newCargoId} 
                                                onChange={e => setNewCargoId(e.target.value)}
                                                disabled={!newDeptId}
                                            >
                                                <option value="">Selecione a Função...</option>
                                                {availableCargos.map(s => (
                                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Motivo da Alteração (Opcional)</label>
                                    <textarea 
                                        placeholder="Ex: Excelente desempenho nas avaliações do trimestre..."
                                        value={motivo}
                                        onChange={e => setMotivo(e.target.value)}
                                    />
                                </div>

                                <div className={styles.infoAlert}>
                                    <FaInfoCircle />
                                    <p>Esta alteração atualizará o perfil do funcionário em todo o sistema e gerará uma entrada no histórico oficial.</p>
                                </div>
                            </div>

                            <div className={styles.modalFooterModern}>
                                <button className={styles.btnSec} onClick={() => setSelectedEmployee(null)}>Cancelar</button>
                                <button 
                                    className={styles.btnPri} 
                                    onClick={handlePromoteSubmit}
                                    disabled={isSubmitting || !newCargoId}
                                >
                                    {isSubmitting ? 'Processando...' : <><FaSave /> Confirmar Alteração</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

