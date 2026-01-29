import React, { useState } from 'react';
import { FaUsers, FaClipboardCheck, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import Graficos from '../../components/Graficos/index';

export default function Dashboard() {
  
  // KPIs com nova estrutura de cores
  const metrics = [
    { 
      title: 'Funcionários', 
      value: '154', 
      icon: <FaUsers />, 
      gradient: 'blueGradient', 
      percent: '+12% este mês' 
    },
    { 
      title: 'Avaliações Feitas', 
      value: '92%', 
      icon: <FaClipboardCheck />, 
      gradient: 'greenGradient', 
      percent: 'Meta atingida' 
    },
    { 
      title: 'Desempenho Médio', 
      value: '8.4', 
      icon: <FaChartLine />, 
      gradient: 'orangeGradient', 
      percent: '+0.4 pts' 
    },
    { 
      title: 'Ações Pendentes', 
      value: '5', 
      icon: <FaExclamationTriangle />, 
      gradient: 'redGradient', 
      percent: 'Requer atenção' 
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{color: '#64748b'}}>Visão geral de performance em tempo real</p>
        </div>
      </div>

      {/* KPIs Coloridos */}
      <div className={styles.metricsGrid}>
        {metrics.map((item, index) => (
          <div key={index} className={`${styles.kpiCard} ${styles[item.gradient]}`}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>{item.icon}</div>
              <span className={styles.kpiPercent}>{item.percent}</span>
            </div>
            <div className={styles.kpiContent}>
              <div className={styles.kpiValue}>{item.value}</div>
              <div className={styles.kpiLabel}>{item.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos Novos (Radar, Barra, Rosca) */}
      <Graficos />

      {/* Atividades Recentes (Carrossel Horizontal) */}
      <h3 className={styles.sectionTitle}>Últimas Atualizações</h3>
      <div className={styles.activitiesRow}>
        <div className={styles.activityCard}>
          <div className={styles.avatarSmall}>JS</div>
          <div className={styles.activityInfo}>
            <h4>João Silva</h4>
            <p>Concluiu autoavaliação</p>
          </div>
        </div>
        <div className={styles.activityCard}>
          <div className={styles.avatarSmall}>MS</div>
          <div className={styles.activityInfo}>
            <h4>Maria Santos</h4>
            <p>Atualizou perfil</p>
          </div>
        </div>
        <div className={styles.activityCard}>
          <div className={styles.avatarSmall} style={{background: '#dcfce7', color: '#166534'}}>RH</div>
          <div className={styles.activityInfo}>
            <h4>Novo Ciclo</h4>
            <p>Ciclo Q1 iniciado</p>
          </div>
        </div>
        <div className={styles.activityCard}>
           <div className={styles.avatarSmall}>PC</div>
           <div className={styles.activityInfo}>
             <h4>Pedro Costa</h4>
             <p>Solicitou feedback</p>
           </div>
        </div>
      </div>
    </div>
  )
}
