import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardCheck, FaChartLine, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import DashboardCalendar from '../../../components/DashboardCalendar/index';
import Graficos from '../../../components/Graficos/index';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';

export default function Dashboard() {
  const { employees, history } = useContext(EmployeeContext);
  const { notifications, hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cálculos Dinâmicos
  const dashboardStats = useMemo(() => {
    // 1. Total de Funcionários Ativos
    const activeEmployees = employees.filter(e => e.status === 'Ativo').length;

    // 2. Total de Avaliações
    const evaluations = history.filter(h => h.tipo === 'avaliacao');
    const totalEvalCount = evaluations.length;

    // 3. Desempenho Médio & Alta Performance
    let avgScore = 0;
    let highPerformers = 0;

    if (totalEvalCount > 0) {
      const scores = evaluations.map(h => {
        if (typeof h.resultadoQuantitativo === 'string' && h.resultadoQuantitativo.includes('/')) {
          return parseFloat(h.resultadoQuantitativo.split('/')[0]);
        }
        return 0;
      });
      avgScore = scores.reduce((a, b) => a + b, 0) / totalEvalCount;
      highPerformers = scores.filter(s => s >= 16).length;
    }

    // 4. Ações Pendentes
    const pendingEvals = history.filter(h => h.resultadoQualitativo === 'Pendente').length;
    const pendingAdmins = notifications.filter(n => n.type === 'new_registration').length;
    const totalPending = pendingEvals + pendingAdmins;

    return {
      activeEmployees,
      totalEvalCount,
      avgScore: avgScore.toFixed(1),
      highPerformers,
      totalPending
    };
  }, [employees, history, notifications]);

  const metrics = [
    {
      title: 'Funcionários',
      value: dashboardStats.activeEmployees.toString(),
      icon: <FaUsers />,
      gradient: 'blueGradient',
      percent: 'Total ativos'
    },
    {
      title: 'Avaliações Feitas',
      value: dashboardStats.totalEvalCount.toString(),
      icon: <FaClipboardCheck />,
      gradient: 'greenGradient',
      percent: 'Registros no sistema'
    },
    {
      title: 'Desempenho Médio',
      value: dashboardStats.avgScore,
      icon: <FaChartLine />,
      gradient: 'orangeGradient',
      percent: 'Escala 0-20'
    },
    {
      title: 'Ações Pendentes',
      value: dashboardStats.totalPending.toString(),
      icon: <FaExclamationTriangle />,
      gradient: 'redGradient',
      percent: 'Requer atenção'
    },
  ];

  if (!hasPermission('dashboard', 'Painel Executivo')) {
    return (
      <div className="page-container">
        <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
          <p>Você não tem permissão para visualizar o painel executivo.</p>
          <button className="btn-primary" onClick={() => navigate('/minha-conta')} style={{ marginTop: '20px' }}>Ir para Minha Conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: '#64748b' }}>Visão geral de performance em tempo real</p>
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

      {/* Gráficos de Medição */}
      <div style={{ marginTop: '5px' }}>
        <Graficos />
      </div>

      {/* Grid Inferior: Alta performance e Agenda */}
      <div className={styles.bottomGridCompact} style={{ marginTop: '25px' }}>
        <div className={styles.altaPerformanceCard}>
          <div className={styles.altaHeader}>
            <div className={styles.iconCircle}>
              <FaStar />
            </div>
            <div>
              <h3>Alta Performance</h3>
              <p>Funcionários excelente (≥ 16)</p>
            </div>
          </div>
          <div className={styles.altaContent}>
            <div className={styles.altaValueLine}>
              <h1>{dashboardStats.highPerformers}</h1>
              <span>funcionários</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${dashboardStats.totalEvalCount > 0 ? (dashboardStats.highPerformers / dashboardStats.totalEvalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className={styles.altaDesc}><strong>{dashboardStats.totalEvalCount > 0 ? Math.round((dashboardStats.highPerformers / dashboardStats.totalEvalCount) * 100) : 0}%</strong> do total.</p>
          </div>
        </div>

        {/* Card do Meio: Metas */}
        <div className={styles.metasCard}>
          <div className={styles.metasHeader}>
            <FaChartLine style={{ color: 'var(--primary-color)' }} />
            <h3>Metas da Instituição</h3>
          </div>
          <div className={styles.metasList}>
            <div className={styles.metaItem}>
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Taxa de Avaliação</span>
                <span className={styles.metaValue}>82%</span>
              </div>
              <div className={styles.metaBar}>
                <div className={styles.metaFill} style={{ width: '82%', background: '#10b981' }}></div>
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Formação Contínua</span>
                <span className={styles.metaValue}>65%</span>
              </div>
              <div className={styles.metaBar}>
                <div className={styles.metaFill} style={{ width: '65%', background: '#3b82f6' }}></div>
              </div>
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaInfo}>
                <span className={styles.metaLabel}>Engajamento</span>
                <span className={styles.metaValue}>94%</span>
              </div>
              <div className={styles.metaBar}>
                <div className={styles.metaFill} style={{ width: '94%', background: '#8b5cf6' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.calendarSection}>
          <DashboardCalendar />
        </div>
      </div>
    </div>
  )
}
