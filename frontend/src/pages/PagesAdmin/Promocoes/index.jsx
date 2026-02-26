import React, { useState, useContext } from 'react';
import { FaTrophy, FaUserTie, FaBuilding, FaArrowUp, FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import { departmentsData } from '../../../utils/departmentsData';
import styles from './Promocoes.module.css';

export default function Promocoes() {
    const { employees, updateEmployee, addHistoryEvent, departments } = useContext(EmployeeContext);
    const { hasPermission } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isPromoting, setIsPromoting] = useState(false);

    // Agrupar funcionários por departamento
    const employeesByDept = departments.map(dept => {
        return {
            ...dept,
            staffMembers: employees.filter(emp => emp.dept === dept.nome &&
                (emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.cargo.toLowerCase().includes(searchTerm.toLowerCase())))
        };
    }).filter(dept => dept.staffMembers.length > 0);

    const handlePromote = async () => {
        if (!newRole) return alert('Por favor, insira o novo cargo.');

        // Atualizar funcionário
        await updateEmployee(selectedEmployee.id, {
            ...selectedEmployee,
            cargo: newRole
        });

        // Registrar no histórico
        await addHistoryEvent({
            data: new Date().toISOString(),
            evento: `Promoção: ${selectedEmployee.cargo} → ${newRole}`,
            tipo: 'promocao',
            funcionarioId: selectedEmployee.id,
            funcionario: selectedEmployee.nome,
            cargo: newRole,
            dept: selectedEmployee.dept,
            resultadoQuantitativo: 'N/A',
            resultadoQualitativo: 'Promovido',
            criterios: []
        });

        alert(`${selectedEmployee.nome} foi promovido com sucesso para ${newRole}!`);
        setSelectedEmployee(null);
        setNewRole('');
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
                <div>
                    <h1 className="page-title">Plano de Promoções</h1>
                    <p style={{ color: '#64748b' }}>Gerencie o crescimento e progressão de carreira dos colaboradores</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar funcionário ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.deptGrid}>
                {employeesByDept.map(dept => (
                    <div key={dept.id} className={styles.deptCard}>
                        <div className={styles.deptHeader} style={{ borderLeftColor: dept.color }}>
                            <div className={styles.deptIcon} style={{ color: dept.color }}>
                                <FaBuilding />
                            </div>
                            <div className={styles.deptInfo}>
                                <h3 className={styles.deptName}>{dept.nome}</h3>
                                <span className={styles.deptCount}>{dept.staffMembers.length} Colaboradores</span>
                            </div>
                        </div>

                        <div className={styles.employeeList}>
                            {dept.staffMembers.map(emp => (
                                <div key={emp.id} className={styles.employeeItem}>
                                    <div className={styles.empMain}>
                                        <div className={styles.avatar}>
                                            {emp.foto ? (
                                                <img src={emp.foto} alt={emp.nome} />
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
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Promoção */}
            {selectedEmployee && (
                <div className={styles.modalOverlay} onClick={() => setSelectedEmployee(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedEmployee(null)}>
                            <FaTimes />
                        </button>

                        <div className={styles.modalHeader}>
                            <div className={styles.trophyIcon}>
                                <FaTrophy />
                            </div>
                            <h2 className={styles.modalTitle}>Promover Colaborador</h2>
                            <p className={styles.modalSubtitle}>Defina o novo passo na carreira de {selectedEmployee.nome}</p>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.currentStatus}>
                                <div className={styles.statusItem}>
                                    <label>Cargo Atual</label>
                                    <span>{selectedEmployee.cargo}</span>
                                </div>
                                <div className={styles.statusArrow}>
                                    <FaArrowUp />
                                </div>
                                <div className={styles.statusItem}>
                                    <label>Novo Cargo</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Gerente de Projetos"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className={styles.modalAlert}>
                                <p>Esta ação será registrada no histórico do funcionário e atualizará seu perfil imediatamente.</p>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.btnCancel}
                                onClick={() => setSelectedEmployee(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className={styles.btnSave}
                                onClick={handlePromote}
                            >
                                <FaSave /> Confirmar Promoção
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
