import React, { useState } from 'react';
import { FaSearch, FaFilePdf, FaFileExcel, FaChartBar, FaUsers, FaDownload, FaFilter, FaCalendarAlt, FaCloudDownloadAlt, FaArrowLeft, FaCheckCircle, FaHistory } from 'react-icons/fa';
import styles from './Relatorios.module.css';

export default function Relatorios() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [view, setView] = useState('list'); // 'list' | 'create'

  const categories = [
    { name: 'Todos', icon: null },
    { name: 'Administração', icon: <FaChartBar /> },
    { name: 'Docência', icon: <FaUsers /> },
    { name: 'Serviços Gerais', icon: <FaUsers /> },
    { name: 'TIC', icon: <FaFileExcel /> },
    { name: 'Histórico', icon: <FaHistory /> },
  ];

  const reports = [
    { id: 1, title: 'Avaliação Anual de Desempenho 2024', category: 'Docência', date: '25 Jan 2025', size: '2.4 MB', type: 'pdf' },
    { id: 2, title: 'Inventário de Equipamentos de TI', category: 'TIC', date: '20 Jan 2025', size: '1.8 MB', type: 'excel' },
    { id: 3, title: 'Planeamento de Limpeza Semestral', category: 'Serviços Gerais', date: '15 Jan 2025', size: '3.1 MB', type: 'pdf' },
    { id: 4, title: 'Relatório Financeiro Q4', category: 'Administração', date: '10 Jan 2025', size: '1.2 MB', type: 'excel' },
    { id: 5, title: 'Lista de Professores Ativos', category: 'Docência', date: '05 Jan 2025', size: '850 KB', type: 'excel' },
    { id: 6, title: 'Logs de Segurança do Sistema', category: 'TIC', date: '02 Jan 2025', size: '5.5 MB', type: 'pdf' },
    { id: 7, title: 'Histórico Completo de Atividades 2024', category: 'Histórico', date: '01 Jan 2025', size: '12.5 MB', type: 'excel' },
    { id: 8, title: 'Histórico de Avaliações (Dezembro)', category: 'Histórico', date: '30 Dez 2024', size: '4.2 MB', type: 'pdf' },
  ];

  const filteredReports = selectedCategory === 'Todos' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory);

  if (view === 'create') {
    return (
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
               <button onClick={() => setView('list')} className={styles.backLink}>
                 <FaArrowLeft /> Voltar para Relatórios
               </button>
            </div>
            <h1 className={styles.pageTitle} style={{marginTop: 10}}>Gerar Novo Relatório</h1>
            <p style={{color: 'var(--text-secondary)'}}>Configure os parâmetros para extração de dados.</p>
          </div>
        </div>

        <div className={styles.createFormContainer}>
           {/* Formulário limpo de geração */}
           <div className={styles.formSection}>
             <label>Tipo de Relatório</label>
             <select className={styles.selectInput}>
               <option>Selecione...</option>
               <option>Desempenho Geral</option>
               <option>Financeiro e Custos</option>
               <option>Absenteísmo e Faltas</option>
               <option value="historico">Histórico de Eventos e Atividades</option>
             </select>
           </div>
           
           <div className={styles.formSection}>
             <label>Período</label>
             <div style={{display: 'flex', gap: 10}}>
               <input type="date" className={styles.dateInput} />
               <span style={{alignSelf: 'center', color: 'var(--text-secondary)'}}>até</span>
               <input type="date" className={styles.dateInput} />
             </div>
           </div>

           <div className={styles.formSection}>
             <label>Formato de Saída</label>
             <div style={{display: 'flex', gap: 20}}>
               <label className={styles.radioLabel}>
                  <input type="radio" name="format" defaultChecked /> PDF
               </label>
               <label className={styles.radioLabel}>
                  <input type="radio" name="format" /> Excel (CSV)
               </label>
             </div>
           </div>

           <button className={styles.btnGenerateLarge}>
             <FaCheckCircle /> Processar e Gerar
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Central de Relatórios</h1>
          <p style={{color: 'var(--text-secondary)'}}>Gere, visualize e exporte dados estratégicos.</p>
        </div>
        
        <div className={styles.headerActions}>
           <button className={styles.btnGenerate} onClick={() => setView('create')}>
             <FaCloudDownloadAlt /> Gerar Novo Relatório
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
           <div className={styles.kpiIcon} style={{background: '#eff6ff', color: '#3b82f6'}}><FaFilePdf /></div>
           <div className={styles.kpiInfo}>
             <span>Total Gerados</span>
             <strong>1,240</strong>
           </div>
        </div>
        <div className={styles.kpiCard}>
           <div className={styles.kpiIcon} style={{background: '#f0fdf4', color: '#22c55e'}}><FaDownload /></div>
           <div className={styles.kpiInfo}>
             <span>Downloads (Mês)</span>
             <strong>85</strong>
           </div>
        </div>
        <div className={styles.kpiCard}>
           <div className={styles.kpiIcon} style={{background: '#fff7ed', color: '#f97316'}}><FaChartBar /></div>
           <div className={styles.kpiInfo}>
             <span>Mais Acessado</span>
             <strong style={{fontSize: '14px'}}>Desempenho Anual</strong>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={styles.toolbar}>
        <div className={styles.categoryTabs}>
          {categories.map(cat => (
            <button 
              key={cat.name} 
              className={`${styles.tabBtn} ${selectedCategory === cat.name ? styles.activeTab : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
           <FaSearch />
           <input type="text" placeholder="Buscar relatório..." />
        </div>
      </div>

      {/* Reports Grid */}
      <div className={styles.reportsGrid}>
        {filteredReports.map(report => (
          <div key={report.id} className={styles.reportCard}>
             <div className={styles.cardHeader}>
               <div className={`${styles.fileIcon} ${report.type === 'pdf' ? styles.pdf : styles.excel}`}>
                 {report.type === 'pdf' ? <FaFilePdf /> : <FaFileExcel />}
               </div>
               <button className={styles.downloadBtn}><FaDownload /></button>
             </div>
             
             <div className={styles.cardBody}>
               <span className={styles.reportCategory}>{report.category}</span>
               <h3 className={styles.reportTitle}>{report.title}</h3>
               
               <div className={styles.cardFooter}>
                 <span><FaCalendarAlt /> {report.date}</span>
                 <span>{report.size}</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
