import React from 'react';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { FaChartLine, FaCheckCircle, FaClipboardList, FaTrophy, FaCalendarAlt, FaExclamationCircle, FaLightbulb, FaQuoteLeft } from 'react-icons/fa';
import styles from './Home.module.css';
import { AuthContext } from '../../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Filler, Legend);

const SUGGESTIONS = [
  { text: "A persistência é o caminho do êxito.", author: "Charles Chaplin", icon: <FaTrophy /> },
  { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier", icon: <FaChartLine /> },
  { text: "Foque no progresso, não na perfeição.", author: "Dica de Produtividade", icon: <FaLightbulb /> },
  { text: "A organização do seu espaço reflete a organização da sua mente.", author: "Dica de Eficiência", icon: <FaClipboardList /> },
  { text: "Grandes coisas não são feitas por impulso, mas por uma série de pequenas coisas trazidas juntas.", author: "Vincent Van Gogh", icon: <FaQuoteLeft /> }
];

export default function Home() {
  const { currentUser } = React.useContext(AuthContext);
  const [stats, setStats] = React.useState({
    totalEvaluations: 0,
    avgScore: '0.0',
    pending: 0,
    absencesCount: 0,
    recentScores: [],
    latestCriteria: []
  });
  const [loading, setLoading] = React.useState(true);

  // Garantir que stats.latestCriteria seja sempre um array
  const safeCriteria = React.useMemo(() => {
    return Array.isArray(stats?.latestCriteria) ? stats.latestCriteria : [];
  }, [stats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const currentSuggestion = SUGGESTIONS[new Date().getDate() % SUGGESTIONS.length];

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        const host = window.location.hostname;
        let port = window.location.port;
        if (port === '5173') port = '8000';

        const response = await fetch(`http://${host}:${port}/api/evaluations/my-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Erro ao buscar estatísticas do usuário:", e);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchStats();
  }, [currentUser]);

  // Dados do Gráfico Radar (Focado nos critérios atuais)
  const chartData = {
    labels: safeCriteria.length > 0
      ? safeCriteria.map(c => c.nome)
      : ['Ponto', 'Assid', 'Adapt', 'Relac', 'Org', 'Ética', 'Inic', 'Prazos'],
    datasets: [
      {
        label: 'Desempenho Atual',
        data: safeCriteria.length > 0 ? safeCriteria.map(c => Number(c.nota || 0)) : [0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#e2e8f0' },
        pointLabels: { font: { size: 10, weight: '600' } },
        suggestedMin: 0,
        suggestedMax: 20,
        ticks: { display: false }
      }
    },
    maintainAspectRatio: false
  };

  // Determinar classe de performance
  const avg = Number(stats.avgScore || 0);
  const performanceClass = avg >= 14 ? styles.performanceHigh : avg >= 10 ? styles.performanceMedium : styles.performanceLow;

  return (
    <div className={styles.container}>
      {/* Welcome Hero */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h1>{getGreeting()}, {currentUser?.nome_completo || currentUser?.nome || 'Funcionário'}!</h1>
          <p>Seja bem-vindo ao seu painel de desempenho IPM360.</p>
        </div>
        <div className={styles.dateBadge}>
          <FaCalendarAlt />
          {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.gridStats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.blueBox}`}><FaClipboardList /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalEvaluations}</span>
            <span className={styles.statLabel}>Avaliações</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.greenBox}`}><FaChartLine /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.avgScore}</span>
            <span className={styles.statLabel}>Média Global</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.orangeBox}`}><FaExclamationCircle /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.absencesCount || 0}</span>
            <span className={styles.statLabel}>Faltas Reais</span>
          </div>
        </div>
      </div>

      {/* Charts & Actions */}
      <div className={styles.chartsSection}>
        <div className={`${styles.chartContainer} ${performanceClass}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Análise de Performance</h3>
            <FaTrophy style={{ color: avg >= 14 ? '#eab308' : '#cbd5e1' }} />
          </div>
          <div style={{ height: '220px' }}>
            <Radar data={chartData} options={options} />
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Ações Prioritárias</h3>
          </div>
          <div className={styles.todoList}>
            <div className={styles.todoItem}>
              <FaExclamationCircle className={styles.todoIcon} style={{ color: '#ef4444' }} />
              <div className={styles.todoContent}>
                <h4>Autoavaliação Pendente</h4>
                <p>Verifique o formulário Q1</p>
              </div>
            </div>
            <div className={styles.todoItem}>
              <FaCheckCircle className={styles.todoIcon} style={{ color: '#10b981' }} />
              <div className={styles.todoContent}>
                <h4>Feedback Recebido</h4>
                <p>João Santos visualizou</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.chartContainer} ${styles.suggestionCard}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Sugestão do Dia</h3>
            <FaLightbulb />
          </div>
          <div className={styles.suggestionBox}>
            <div className={styles.suggestionIcon}>{currentSuggestion.icon}</div>
            <p className={styles.suggestionText}>"{currentSuggestion.text}"</p>
            <span className={styles.suggestionAuthor}>{currentSuggestion.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
