import React, { useState } from 'react';
import { FaUser, FaSave, FaComments, FaChartPie, FaChalkboardTeacher, FaUserCheck } from 'react-icons/fa';
import { Radar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './Avaliar.module.css';

Chart.register(...registerables);

const RadarOptions = {
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 5,
      ticks: { display: false },
      grid: { color: '#e2e8f0' },
      pointLabels: { font: { size: 10, weight: '600' }, color: '#64748b' },
    },
  },
  plugins: { legend: { display: false } },
  maintainAspectRatio: false,
};

export default function Avaliar() {
  const [funcionario, setFuncionario] = useState('');
  
  // Grupo 1: Comportamental (4 itens)
  const [grupo1, setGrupo1] = useState({
    pontualidade: 3,
    assiduidade: 3,
    adaptacao: 3,
    relacao_colegas: 3,
  });

  // Grupo 2: Técnico-Pedagógico (6 itens)
  const [grupo2, setGrupo2] = useState({
    ensino_aprendizagem: 3,
    aperfeicoamento: 3,
    inovacao: 3,
    responsabilidade: 3,
    relacao_trabalho: 3,
    atividades_extra: 3,
  });

  const labelsMap = {
    // Grupo 1
    pontualidade: 'Pontualidade',
    assiduidade: 'Assiduidade',
    adaptacao: 'Adaptação',
    relacao_colegas: 'Rel. Colegas',
    // Grupo 2
    ensino_aprendizagem: 'Proc. Ensino',
    aperfeicoamento: 'Aperfeiçoamento',
    inovacao: 'Inovação',
    responsabilidade: 'Responsabilidade',
    relacao_trabalho: 'Rel. Humanas',
    atividades_extra: 'Ativ. Extras',
  };

  // Unindo dados para o gráfico
  const allNotas = { ...grupo1, ...grupo2 };
  const radarData = {
    labels: Object.keys(allNotas).map(k => labelsMap[k]),
    datasets: [{
      label: 'Performance',
      data: Object.values(allNotas),
      backgroundColor: 'rgba(59, 130, 246, 0.2)', // Azul para diferenciar
      borderColor: '#3b82f6',
      borderWidth: 2,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  const handleChangeG1 = (key, val) => setGrupo1(prev => ({ ...prev, [key]: parseInt(val) }));
  const handleChangeG2 = (key, val) => setGrupo2(prev => ({ ...prev, [key]: parseInt(val) }));

  // Cálculo da Nota Final (Escala 0-20)
  // Total Máximo de Pontos Possíveis: 10 critérios * 5 = 50 pontos.
  const calcularTotal = () => {
    const soma1 = Object.values(grupo1).reduce((a, b) => a + b, 0);
    const soma2 = Object.values(grupo2).reduce((a, b) => a + b, 0);
    const somaTotal = soma1 + soma2;
    // Regra de 3: 50pts -> 20 valores
    return (somaTotal / 50) * 20;
  };

  const notaFinal = calcularTotal().toFixed(1); // 1 casa decimal

  const getQualitativa = (val) => {
    if (val < 10) return { label: 'Mau', color: '#ef4444' };
    if (val < 14) return { label: 'Razoável', color: '#f59e0b' };
    if (val < 18) return { label: 'Bom', color: '#3b82f6' };
    return { label: 'Muito Bom', color: '#10b981' };
  };

  const qualitativa = getQualitativa(notaFinal);

  // Componente auxiliar de Slider
  const SliderItem = ({ attrKey, val, onChange, label, color }) => (
    <div className={styles.criteriaItem}>
      <div className={styles.criteriaHeader}>
        <span className={styles.criteriaName}>{label}</span>
        <span className={styles.criteriaValue}>{val} / 5</span>
      </div>
      <input 
        type="range" min="0" max="5" step="1" value={val} 
        className={styles.rangeInput}
        style={{accentColor: color}}
        onChange={(e) => onChange(attrKey, e.target.value)}
      />
      <div className={styles.scaleLabels}><span>0</span><span>5</span></div>
    </div>
  );

  // MOCK DATA DE FUNCIONÁRIOS
  const mockEmployees = {
    '1': {
      id: 1,
      name: 'João Silva',
      role: 'Professor Titular',
      dept: 'Docência',
      email: 'joao.silva@ipm360.ao',
      status: 'Ativo',
      admission: '12/03/2019',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    '2': {
      id: 2,
      name: 'Maria Santos',
      role: 'Coordenadora Pedagógica',
      dept: 'Administração',
      email: 'maria.santos@ipm360.ao',
      status: 'Ativo',
      admission: '05/08/2020',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  };

  const selectedEmployee = funcionario ? mockEmployees[funcionario] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Avaliação de Desempenho</h1>
          <p style={{color: '#64748b'}}>Avaliação Global (Comportamental + Técnico)</p>
        </div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.formColumn}>
          
          <div className="card-modern" style={{marginBottom: '20px'}}>
             <div className={styles.inputWrapper}>
                <FaUser className={styles.icon} />
                <select 
                  className={styles.selectFunc} 
                  value={funcionario} 
                  onChange={e => setFuncionario(e.target.value)}
                >
                  <option value="">Selecione o Avaliado...</option>
                  <option value="1">Prof. João Silva - Docência</option>
                  <option value="2">Dra. Maria Santos - Administração</option>
                </select>
             </div>
          </div>

          {/* Grupo 1 */}
          <div className="card-modern" style={{marginBottom: '20px'}}>
            <h3 className={styles.sectionTitle}><FaUserCheck /> Critérios Comportamentais</h3>
            <div className={styles.criteriaList}>
              {Object.entries(grupo1).map(([key, val]) => (
                <SliderItem 
                  key={key} attrKey={key} val={val} 
                  onChange={handleChangeG1} 
                  label={labelsMap[key]} 
                  color="#2e7d32" // Verde
                />
              ))}
            </div>
          </div>

          {/* Grupo 2 */}
          <div className="card-modern">
            <h3 className={styles.sectionTitle} style={{color: '#1565c0'}}><FaChalkboardTeacher /> Critérios Técnico-Pedagógicos</h3>
            <div className={styles.criteriaList}>
              {Object.entries(grupo2).map(([key, val]) => (
                <SliderItem 
                  key={key} attrKey={key} val={val} 
                  onChange={handleChangeG2} 
                  label={labelsMap[key]} 
                  color="#1565c0" // Azul
                />
              ))}
            </div>

            <div className={styles.feedbackArea}>
               <h3 className={styles.sectionTitle} style={{marginTop: '30px', border: 'none'}}>
                 <FaComments /> Parecer Final
               </h3>
               <textarea rows="4" className={styles.textarea} placeholder="Comentários sobre o desempenho..."></textarea>
            </div>

            <div className={styles.actions}>
               <button className={styles.btnSave}><FaSave /> Registrar Avaliação</button>
            </div>
          </div>
        </div>

        <div className={styles.summaryColumn}>
           
           {/* CARD DE INFORMAÇÃO DO USUÁRIO (NOVO) */}
           {selectedEmployee && (
             <div className={styles.userInfoCard}>
                <div className={styles.avatarContainer}>
                  <img src={selectedEmployee.avatar} alt="Avatar" className={styles.avatarImg} />
                  <div className={styles.statusBadge}></div>
                </div>
                <h3 className={styles.userName}>{selectedEmployee.name}</h3>
                <span className={styles.userRole}>{selectedEmployee.role}</span>
                
                <div className={styles.metaGrid}>
                   <div className={styles.metaItem}>
                     <span className={styles.metaLabel}>Departamento</span>
                     <span className={styles.metaValue}>{selectedEmployee.dept}</span>
                   </div>
                   <div className={styles.metaItem}>
                     <span className={styles.metaLabel}>Admissão</span>
                     <span className={styles.metaValue}>{selectedEmployee.admission}</span>
                   </div>
                   <div className={styles.metaItem} style={{gridColumn: '1 / -1'}}>
                     <span className={styles.metaLabel}>Email</span>
                     <span className={styles.metaValue}>{selectedEmployee.email}</span>
                   </div>
                </div>
             </div>
           )}

           <div className={`${styles.chartCard} card-modern`}>
             <div className={styles.chartHeader}><FaChartPie /> Análise 360°</div>
             <div className={styles.chartBox}>
                <Radar data={radarData} options={RadarOptions} />
             </div>
             <div className={styles.infoBox}>
               <p>Análise de 10 critérios.</p>
             </div>
           </div>

           {/* Novo Card de Classificação */}
           <div className="card-modern" style={{marginTop: '20px', textAlign: 'center', padding: '30px'}}>
             <h3 className={styles.sectionTitle} style={{justifyContent: 'center', border: 'none'}}>Resultado Final</h3>
             
             <div className={styles.summaryScore} style={{backgroundColor: qualitativa.color + '20', color: qualitativa.color}}>
               <span>Classificação Quantitativa</span>
               <strong>{notaFinal} <small style={{fontSize: '14px', color: '#64748b'}}>/ 20</small></strong>
               
               <div style={{marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px'}}>
                 <span style={{marginBottom: '5px'}}>Classificação Qualitativa</span>
                 <div className={styles.qualitativeLabel}>{qualitativa.label}</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
