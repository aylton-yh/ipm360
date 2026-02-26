import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaEllipsisV } from 'react-icons/fa';
import styles from './Status.module.css';

export default function Status() {
  const dados = [];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Concluído': return { className: styles.concluido, icon: <FaCheckCircle /> };
      case 'Em Aberto': return { className: styles.emAberto, icon: <FaSpinner className={styles.spin} /> };
      case 'Pendente': return { className: styles.pendente, icon: <FaExclamationTriangle /> };
      default: return { className: '', icon: null };
    }
  };

  const getFreqClass = (freq) => {
    switch (freq) {
      case 'Diário': return styles.freqDiario;
      case 'Semanal': return styles.freqSemanal;
      case 'Mensal': return styles.freqMensal;
      case 'Trimestral': return styles.freqTrimestral;
      case 'Semestral': return styles.freqSemestral;
      case 'Anual': return styles.freqAnual;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Status das Avaliações</h2>
        <p>Acompanhe detalhadamente o progresso de todos os seus ciclos avaliativos.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ciclo / Frequência</th>
                <th>Período de Avaliação</th>
                <th>Progresso</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Nota</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {dados.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    Nenhum ciclo de avaliação encontrado para este período.
                  </td>
                </tr>
              ) : (
                dados.map((item) => {
                  const config = getStatusConfig(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.cycleInfo}>
                          <span className={`${styles.freqBadge} ${getFreqClass(item.freq)}`}>{item.freq}</span>
                          <span className={styles.cycleName}>{item.ciclo}</span>
                          <span className={styles.cycleDesc}>{item.tipo}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateRange}>
                          <div>
                            <span className={styles.dateLabel}>Início:</span>
                            <span className={styles.dateValue}>{item.inicio}</span>
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <span className={styles.dateLabel}>Término:</span>
                            <span className={styles.dateValue} style={{ color: '#ef4444' }}>{item.fim}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.progressWrapper}>
                          <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{ width: `${item.progresso}%` }}></div>
                          </div>
                          <span className={styles.progressLabel}>{item.progresso}% Completo</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${config.className}`}>
                          {config.icon} {item.status}
                        </span>
                      </td>
                      <td align="center">
                        <div className={`${styles.notaBox} ${item.nota === '-' ? styles.notaEmpty : ''}`}>
                          {item.nota}
                        </div>
                      </td>
                      <td>
                        <button className={styles.btnDetails}>
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
