import React, { useState, useContext, useMemo } from 'react';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { FaPlus, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle, FaFileInvoiceDollar, FaFilter } from 'react-icons/fa';
import styles from './Despesas.module.css';

export default function Despesas() {
    const { employees, expenses, addExpense, removeExpense, updateExpense } = useContext(EmployeeContext);

    const [formData, setFormData] = useState({
        id_funcionario: '',
        categoria: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        valor: '',
        status: 'Pendente'
    });

    const categorias = ['Alimentação', 'Transporte', 'Saúde', 'Infraestrutura', 'Marketing', 'Outros'];

    const stats = useMemo(() => {
        const total = expenses.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
        const pendente = expenses.filter(e => e.status === 'Pendente').reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
        const pago = expenses.filter(e => e.status === 'Pago').reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

        return { total, pendente, pago };
    }, [expenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoria || !formData.valor || !formData.data) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const payload = {
            ...formData,
            id_funcionario: formData.id_funcionario ? parseInt(formData.id_funcionario) : null,
            valor: parseFloat(formData.valor),
            data: new Date(formData.data).toISOString()
        };

        const result = await addExpense(payload);
        if (result.success) {
            setFormData({
                id_funcionario: '',
                categoria: '',
                descricao: '',
                data: new Date().toISOString().split('T')[0],
                valor: '',
                status: 'Pendente'
            });
            alert("Despesa registrada com sucesso!");
        } else {
            alert("Erro ao registrar despesa.");
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Pendente' ? 'Pago' : currentStatus === 'Pago' ? 'Cancelado' : 'Pendente';
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            await updateExpense(id, { ...expense, status: nextStatus });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Minhas Despesas</h1>
                    <p>Gestão financeira e controle de gastos da organização</p>
                </div>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <FaFileInvoiceDollar />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Total Acumulado</h3>
                        <div className={styles.statValue}>{stats.total.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#f59e0b' }}>
                        <FaClock />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Pendentes</h3>
                        <div className={styles.statValue}>{stats.pendente.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <FaCheckCircle />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Total Pago</h3>
                        <div className={styles.statValue}>{stats.pago.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</div>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h2>Histórico de Despesas</h2>
                        <button className={styles.actionBtn}><FaFilter /> Filtrar</button>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Categoria</th>
                                    <th>Funcionário</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length > 0 ? expenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{new Date(expense.data).toLocaleDateString()}</td>
                                        <td>{expense.categoria}</td>
                                        <td>{expense.funcionario_nome || 'Geral'}</td>
                                        <td style={{ fontWeight: '600' }}>{parseFloat(expense.valor).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                                        <td>
                                            <span className={`${styles.badge} ${expense.status === 'Pago' ? styles.badgePaid : expense.status === 'Cancelado' ? styles.badgeCanceled : styles.badgePending}`}
                                                onClick={() => handleStatusChange(expense.id, expense.status)}
                                                style={{ cursor: 'pointer' }}>
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => removeExpense(expense.id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            Nenhuma despesa registrada ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.formCard}>
                    <h2>Nova Despesa</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Categoria *</label>
                            <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                                <option value="">Selecione uma categoria</option>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Funcionário Responsável</label>
                            <select value={formData.id_funcionario} onChange={e => setFormData({ ...formData, id_funcionario: e.target.value })}>
                                <option value="">Geral / Administrativo</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Valor (AOA) *</label>
                            <input type="number" step="0.01" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} placeholder="0,00" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Data *</label>
                            <input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Descrição</label>
                            <textarea rows="3" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} placeholder="Detalhes da despesa..."></textarea>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            <FaPlus /> Registrar Despesa
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
