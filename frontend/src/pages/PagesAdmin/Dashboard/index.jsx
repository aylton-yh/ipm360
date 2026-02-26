import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardCheck, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import styles from './Dashboard.module.css';
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

    // 3. Desempenho Médio
    let avgScore = 0;
    if (totalEvalCount > 0) {
      const scores = evaluations.map(h => {
        if (typeof h.resultadoQuantitativo === 'string' && h.resultadoQuantitativo.includes('/')) {
          return parseFloat(h.resultadoQuantitativo.split('/')[0]);
        }
        return 0;
      });
      avgScore = scores.reduce((a, b) => a + b, 0) / totalEvalCount;
    }

    // 4. Ações Pendentes (Avaliações Pendentes + Notificações de Registro)
    const pendingEvals = history.filter(h => h.resultadoQualitativo === 'Pendente').length;
    const pendingAdmins = notifications.filter(n => n.type === 'new_registration').length;
    const totalPending = pendingEvals + pendingAdmins;

    return {
      activeEmployees,
      totalEvalCount,
      avgScore: avgScore.toFixed(1),
      totalPending
    };
  }, [employees, history, notifications]);

  // Pegar as 4 atividades mais recentes
  const recentActivities = useMemo(() => {
    return history.slice(0, 4);
  }, [history]);

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

      {/* Gráficos Novos (Radar, Barra, Rosca) */}
      <Graficos />

      {/* Atividades Recentes Dinâmicas */}
      <h3 className={styles.sectionTitle}>Últimas Atualizações</h3>
      <div className={styles.activitiesRow}>
        {recentActivities.length === 0 ? (
          <p style={{ color: '#64748b', padding: '10px' }}>Nenhuma atividade recente encontrada.</p>
        ) : (
          recentActivities.map((activity, idx) => (
            <div key={idx} className={styles.activityCard}>
              <div className={styles.avatarSmall}>
                {activity.funcionario.charAt(0)}
              </div>
              <div className={styles.activityInfo}>
                <h4>{activity.funcionario}</h4>
                <p>{activity.evento}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
