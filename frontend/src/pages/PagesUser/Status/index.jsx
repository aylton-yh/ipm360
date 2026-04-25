import React, { useState, useEffect, useContext } from 'react';
import {
  FaCalendarAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle,
  FaEllipsisV, FaChartLine, FaClipboardList, FaExclamationCircle
} from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Status.module.css';

export default function Status() {
  const { getApiUrl } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    avgScore: '0.0',
    pending: 0
  });
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
      if (!token) return;
      try {
        const [statsRes, evalsRes] = await Promise.all([
          fetch(getApiUrl('/api/evaluations/my-stats'), { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(getApiUrl('/api/evaluations/my-evaluations'), { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (evalsRes.ok) setEvaluations(await evalsRes.json());
      } catch (e) {
        console.error("Erro ao buscar dados de status:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getApiUrl]);

  const getStatusConfig = (status) => {
    // Mapear qualitativo do backend para o status da tabela
    if (status === 'Pendente') return { className: styles.pendente, icon: <FaExclamationTriangle />, text: 'Pendente' };
    return { className: styles.concluido, icon: <FaCheckCircle />, text: 'Concluído' };
  };

  if (loading) return <div className={styles.loading}>Carregando status...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Status das Avaliações</h2>
        <p>Acompanhe detalhadamente o progresso e desempenho de todos os seus ciclos.</p>
      </div>

      {/* Stats Summary Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statMiniCard}>
          <div className={`${styles.iconCircle} ${styles.blue}`}><FaClipboardList /></div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.totalEvaluations}</span>
            <span className={styles.statLab}>Total Avaliações</span>
          </div>
        </div>
        <div className={styles.statMiniCard}>
          <div className={`${styles.iconCircle} ${styles.green}`}><FaChartLine /></div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.avgScore}</span>
            <span className={styles.statLab}>Média de Desempenho</span>
          </div>
        </div>
        <div className={styles.statMiniCard}>
          <div className={`${styles.iconCircle} ${styles.orange}`}><FaExclamationCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.absencesCount || 0}</span>
            <span className={styles.statLab}>Faltas (Presença)</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ciclo / Tipo</th>
                <th>Data de Realização</th>
                <th>Resultado Qualitativo</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Nota (Média)</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    Nenhuma avaliação registrada até o momento.
                  </td>
                </tr>
              ) : (
                evaluations.map((item, idx) => {
                  const config = getStatusConfig(item.status || 'Concluído');
                  return (
                    <tr key={idx}>
                      <td>
                        <div className={styles.cycleInfo}>
                          <span className={`${styles.freqBadge} ${styles.freqMensal}`}>AVALIAÇÃO</span>
                          <span className={styles.cycleName}>{item.evento === 'avaliacao' ? 'Performance Global' : item.evento}</span>
                          <span className={styles.cycleDesc}>Sistema IPM360</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateValue}>
                          <FaCalendarAlt />
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td>
                        <span className={styles.qualitativeText}>{item.resultadoQualitativo}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${config.className}`}>
                          {config.icon} {config.text}
                        </span>
                      </td>
                      <td align="center">
                        <div className={styles.notaBox}>
                          {Number(item.score || 0).toFixed(1)}
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
