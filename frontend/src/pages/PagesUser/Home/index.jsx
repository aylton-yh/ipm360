import React from 'react';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaCheckCircle, FaClipboardList, FaTrophy, FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';
import styles from './Home.module.css';
import { AuthContext } from '../../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function Home() {
  const { currentUser } = React.useContext(AuthContext);

  // Dados do Gráfico de Evolução
  const data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Desempenho Geral',
        data: [3.5, 3.8, 4.0, 4.2, 4.5, 4.8],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 5, grid: { borderDash: [5, 5] } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className={styles.container}>
      {/* Welcome Hero */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h1>Olá, {currentUser?.nome || 'Colaborador'}!</h1>
          <p>Aqui está o resumo do seu desempenho profissional.</p>
        </div>
        <div className={styles.dateBadge}>
          <FaCalendarAlt style={{ marginRight: '8px' }} />
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.gridStats}>
        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.blueIcon}`}><FaClipboardList /></div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Avaliações Recebidas</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.greenIcon}`}><FaChartLine /></div>
          <div className={styles.statValue}>0.0</div>
          <div className={styles.statLabel}>Média Global</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.orangeIcon}`}><FaExclamationCircle /></div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Pendentes</div>
        </div>
      </div>

      {/* Charts & Actions */}
      <div className={styles.chartsSection}>
        <div className={styles.chartContainer}>
          <h3 className={styles.sectionTitle}>Evolução de Desempenho (Semestre)</h3>
          <div style={{ height: '250px' }}>
            <Line data={data} options={options} />
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.sectionTitle}>Ações Prioritárias</h3>
          <div className={styles.todoList}>
            <div className={styles.todoItem}>
              <FaExclamationCircle className={styles.todoIcon} style={{ color: '#ef4444' }} />
              <div className={styles.todoContent}>
                <h4>Autoavaliação Q2</h4>
                <p>Vence em 2 dias</p>
              </div>
            </div>
            <div className={styles.todoItem}>
              <FaCheckCircle className={styles.todoIcon} style={{ color: '#22c55e' }} />
              <div className={styles.todoContent}>
                <h4>Feedback de Gestor</h4>
                <p>Visualizado ontem</p>
              </div>
            </div>
            <div className={styles.todoItem}>
              <FaChartLine className={styles.todoIcon} style={{ color: '#3b82f6' }} />
              <div className={styles.todoContent}>
                <h4>Meta de Produtividade</h4>
                <p>85% Atingido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
