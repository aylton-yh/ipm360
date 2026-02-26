import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './Graficos.module.css';
import { useContext } from 'react';
import { EmployeeContext } from '../../context/EmployeeContext';

Chart.register(...registerables);

Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.color = '#64748b';

// 1. Gráfico de Área (Wave Chart) - O mais bonito e moderno
const dataWave = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Performance 2024',
      data: [60, 65, 55, 75, 70, 85, 80, 92, 88, 95, 90, 98],
      fill: true,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)'); // Azul Céu
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
        return gradient;
      },
      borderColor: '#0ea5e9', // Azul Sky 500
      borderWidth: 3,
      tension: 0.4, // Curva suave (Onda)
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#0ea5e9',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    },
    {
      label: 'Performance 2023',
      data: [50, 55, 45, 60, 58, 65, 60, 70, 68, 75, 72, 80],
      fill: true,
      backgroundColor: 'transparent',
      borderColor: '#cbd5e1', // Cinza suave
      borderWidth: 2,
      borderDash: [5, 5], // Linha tracejada
      tension: 0.4,
      pointRadius: 0,
    },
  ],
};

const optionsWave = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false } },
    y: {
      grid: { borderDash: [4, 4], color: '#f1f5f9' },
      border: { display: false },
      min: 0,
      max: 20
    },
  },
  interaction: { mode: 'index', intersect: false },
};

// 2. Gráfico de Rosca Ultra-Fina (Moderno)
const dataStatus = {
  labels: ['Alta Performance', 'Média', 'Baixa'],
  datasets: [
    {
      data: [65, 25, 10],
      backgroundColor: ['#0ea5e9', '#6366f1', '#f43f5e'], // Azul, Roxo, Rosa
      borderWidth: 0,
      hoverOffset: 5,
      borderRadius: 20, // Cantos arredondados nos segmentos
      spacing: 5, // Espaço entre segmentos
    },
  ],
};

const optionsStatus = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '85%', // Muito fino
  plugins: { legend: { display: false } },
};

export default function Graficos() {
  const { history } = useContext(EmployeeContext);
  const evaluations = history.filter(h => h.tipo === 'avaliacao');

  // 1. Processar dados para o Wave Chart (Média de performance por mês)
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const processMonthlyData = (year) => {
    return months.map((_, index) => {
      const monthEvals = evaluations.filter(h => {
        const date = new Date(h.data);
        return date.getMonth() === index && date.getFullYear() === year;
      });
      if (monthEvals.length === 0) return 0;
      const sum = monthEvals.reduce((acc, curr) => {
        const score = parseFloat(curr.resultadoQuantitativo?.split('/')[0] || 0);
        return acc + score;
      }, 0);
      return (sum / monthEvals.length);
    });
  };

  const dynamicDataWave = {
    labels: months,
    datasets: [
      {
        label: `Performance ${currentYear}`,
        data: processMonthlyData(currentYear),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
          return gradient;
        },
        borderColor: '#0ea5e9',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: `Performance ${currentYear - 1}`,
        data: processMonthlyData(currentYear - 1),
        fill: false,
        borderColor: '#cbd5e1',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // 2. Processar dados para o Status Chart
  const alta = evaluations.filter(h => parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0) >= 16).length;
  const media = evaluations.filter(h => {
    const s = parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0);
    return s >= 10 && s < 16;
  }).length;
  const baixa = evaluations.filter(h => parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0) < 10).length;

  const total = alta + media + baixa;
  const percentAlta = total > 0 ? Math.round((alta / total) * 100) : 0;

  const dynamicDataStatus = {
    labels: ['Alta Performance', 'Média', 'Baixa'],
    datasets: [
      {
        data: total > 0 ? [alta, media, baixa] : [0, 0, 1], // Mostra tudo baixo se vazio
        backgroundColor: total > 0 ? ['#0ea5e9', '#6366f1', '#f43f5e'] : ['#f1f5f9', '#f1f5f9', '#f1f5f9'],
        borderWidth: 0,
        borderRadius: 20,
        spacing: 5,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.mainChart}`}>
        <div className={styles.header}>
          <div>
            <h3>Estatística de Desempenho</h3>
            <p>Comparativo anual (Média Global 0-20)</p>
          </div>
        </div>
        <div className={styles.waveWrapper}>
          <Line data={dynamicDataWave} options={optionsWave} />
        </div>
      </div>

      <div className={`${styles.card} ${styles.sideChart}`}>
        <div className={styles.header}>
          <h3>Status Geral</h3>
        </div>
        <div className={styles.doughnutWrapper}>
          <Doughnut data={dynamicDataStatus} options={optionsStatus} />
          <div className={styles.centerInfo}>
            <h2>{percentAlta}%</h2>
            <span>Alta Perf.</span>
          </div>
        </div>
        <div className={styles.legendRow}>
          <div className={styles.legendItem}><span style={{ background: '#0ea5e9' }}></span>Alta ({alta})</div>
          <div className={styles.legendItem}><span style={{ background: '#6366f1' }}></span>Média ({media})</div>
          <div className={styles.legendItem}><span style={{ background: '#f43f5e' }}></span>Baixa ({baixa})</div>
        </div>
      </div>
    </div>
  );
}
