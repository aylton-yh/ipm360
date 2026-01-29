import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './Graficos.module.css';

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
    y: { grid: { borderDash: [4, 4], color: '#f1f5f9' }, border: { display: false } },
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
  return (
    <div className={styles.container}>
      {/* Gráfico Principal (Wave) */}
      <div className={`${styles.card} ${styles.mainChart}`}>
        <div className={styles.header}>
          <div>
            <h3>Estatística de Desempenho</h3>
            <p>Comparativo anual (Média Global)</p>
          </div>
          <select className={styles.select}>
            <option>Este Ano</option>
            <option>Ano Passado</option>
          </select>
        </div>
        <div className={styles.waveWrapper}>
          <Line data={dataWave} options={optionsWave} />
        </div>
      </div>

      {/* Gráfico Secundário (Status) */}
      <div className={`${styles.card} ${styles.sideChart}`}>
        <div className={styles.header}>
          <h3>Status Geral</h3>
        </div>
        <div className={styles.doughnutWrapper}>
          <Doughnut data={dataStatus} options={optionsStatus} />
          <div className={styles.centerInfo}>
             <h2>65%</h2>
             <span>Alta Perf.</span>
          </div>
        </div>
        <div className={styles.legendRow}>
          <div className={styles.legendItem}><span style={{background:'#0ea5e9'}}></span>Alta</div>
          <div className={styles.legendItem}><span style={{background:'#6366f1'}}></span>Média</div>
          <div className={styles.legendItem}><span style={{background:'#f43f5e'}}></span>Baixa</div>
        </div>
      </div>
    </div>
  );
}
