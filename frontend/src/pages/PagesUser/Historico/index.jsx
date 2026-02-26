import React, { useState, useEffect } from 'react';
import { FaHistory, FaCalendarAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import styles from './Historico.module.css';

export default function Historico() {
    // Mock data for now, mirroring the database structure we designed
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        // Simulating fetching data from localStorage or API
        const saved = localStorage.getItem('ipm360_user_history');
        if (saved) {
            setHistorico(JSON.parse(saved));
        } else {
            // Mock initial data for demonstration if empty
            const initialData = [
                { id: 1, acao: 'Login', detalhes: 'Acesso realizado com sucesso', data_hora: new Date().toISOString(), ip: '192.168.1.1' },
                { id: 2, acao: 'Visualização', detalhes: 'Acessou tela de Minhas Avaliações', data_hora: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1' },
                { id: 3, acao: 'Atualização', detalhes: 'Atualizou foto de perfil', data_hora: new Date(Date.now() - 172800000).toISOString(), ip: '192.168.1.1' },
            ];
            setHistorico(initialData);
            localStorage.setItem('ipm360_user_history', JSON.stringify(initialData));
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h2>Histórico de Atividades</h2>
                <p>Acompanhe todas as ações realizadas na sua conta.</p>
            </div>

            <div className={styles.historyList}>
                {historico.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaHistory size={48} color="#cbd5e1" />
                        <p>Nenhuma atividade registrada encontrada.</p>
                    </div>
                ) : (
                    historico.map((item) => (
                        <div key={item.id} className={styles.historyItem}>
                            <div className={styles.iconWrapper}>
                                <FaInfoCircle />
                            </div>
                            <div className={styles.content}>
                                <div className={styles.header}>
                                    <span className={styles.actionTitle}>{item.acao}</span>
                                    <span className={styles.date}>
                                        <FaCalendarAlt className={styles.miniIcon} />
                                        {new Date(item.data_hora).toLocaleDateString()}
                                        <FaClock className={styles.miniIcon} style={{ marginLeft: '8px' }} />
                                        {new Date(item.data_hora).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className={styles.details}>{item.detalhes}</p>
                                {item.ip && <span className={styles.ipInfo}>IP: {item.ip}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
