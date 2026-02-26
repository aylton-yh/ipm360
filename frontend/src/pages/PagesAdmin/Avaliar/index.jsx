import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import { FaUser, FaSave, FaComments, FaChartPie, FaChalkboardTeacher, FaUserCheck, FaBuilding } from 'react-icons/fa';
import { Radar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './Avaliar.module.css';
// import { departmentsData } from '../../../utils/departmentsData';

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
  const { t } = useTranslation();
  console.log("DEBUG: AuthContext in Avaliar:", AuthContext); // Debug log
  const navigate = useNavigate();
  const { addHistoryEvent, employees, departments } = useContext(EmployeeContext);
  const { hasPermission } = useContext(AuthContext);
  const [selectedDept, setSelectedDept] = useState('');
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

  // Grupo 3: Profissional (4 itens)
  const [grupo3, setGrupo3] = useState({
    organizacao: 3,
    etica: 3,
    iniciativa: 3,
    prazos: 3,
  });

  const labelsMap = {
    // Grupo 1
    pontualidade: t('labels.pontualidade'),
    assiduidade: t('labels.assiduidade'),
    adaptacao: t('labels.adaptacao'),
    relacao_colegas: t('labels.relacao_colegas'),
    // Grupo 2
    ensino_aprendizagem: t('labels.ensino_aprendizagem'),
    aperfeicoamento: t('labels.aperfeicoamento'),
    inovacao: t('labels.inovacao'),
    responsabilidade: t('labels.responsabilidade'),
    relacao_trabalho: t('labels.relacao_trabalho'),
    atividades_extra: t('labels.atividades_extra'),
    // Grupo 3
    organizacao: t('labels.organizacao'),
    etica: t('labels.etica'),
    iniciativa: t('labels.iniciativa'),
    prazos: t('labels.prazos'),
  };

  const selectedEmployee = funcionario ? employees.find(e => e.id === parseInt(funcionario)) : null;
  const isDocencia = selectedEmployee?.dept === 'Docência';

  // Unindo dados para o gráfico - Filtramos o grupo 2 se não for Docência
  const allNotas = isDocencia
    ? { ...grupo1, ...grupo2, ...grupo3 }
    : { ...grupo1, ...grupo3 };

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
  const handleChangeG3 = (key, val) => setGrupo3(prev => ({ ...prev, [key]: parseInt(val) }));

  // Cálculo da Nota Final (Escala 0-20)
  const calcularTotal = () => {
    const soma1 = Object.values(grupo1).reduce((a, b) => a + b, 0);
    const soma2 = isDocencia ? Object.values(grupo2).reduce((a, b) => a + b, 0) : 0;
    const soma3 = Object.values(grupo3).reduce((a, b) => a + b, 0);
    const somaTotal = soma1 + soma2 + soma3;

    // Total Máximo: 14 critérios se Docência (70 pts), 8 critérios se outros (40 pts)
    const maxPontos = isDocencia ? 70 : 40;
    return (somaTotal / maxPontos) * 20;
  };

  const notaFinal = calcularTotal().toFixed(1); // 1 casa decimal

  const getQualitativa = (val) => {
    if (val < 10) return { label: t('rating.mau'), color: '#ef4444' };
    if (val < 14) return { label: t('rating.razoavel'), color: '#f59e0b' };
    if (val < 18) return { label: t('rating.bom'), color: '#3b82f6' };
    return { label: t('rating.muito_bom'), color: '#10b981' };
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
        style={{ accentColor: color }}
        onChange={(e) => onChange(attrKey, e.target.value)}
      />
      <div className={styles.scaleLabels}><span>0</span><span>5</span></div>
    </div>
  );



  // Filtrar funcionários pelo departamento selecionado
  const filteredEmployees = employees.filter((emp) => {
    if (!selectedDept) return false;
    // Encontrar nome do departamento pelo ID
    // departments usa 'nome'. Vamos comparar strings.
    const deptObj = departments.find(d => d.id === parseInt(selectedDept));
    return deptObj && emp.dept === deptObj.nome;
  });

  if (!hasPermission('avaliacoes', 'Realizar')) {
    return (
      <div className="page-container">
        <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
          <p>Você não tem permissão para realizar avaliações.</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('page_title')}</h1>
          <p style={{ color: '#64748b' }}>{t('page_subtitle')}</p>
        </div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.formColumn}>

          <div className="card-modern" style={{ marginBottom: '20px' }}>
            <div className={styles.inputWrapper} style={{ marginBottom: '15px' }}>
              <FaBuilding className={styles.icon} />
              <select
                className={styles.selectFunc}
                value={selectedDept}
                onChange={e => {
                  setSelectedDept(e.target.value);
                  setFuncionario(''); // Resetar funcionário ao mudar departamento
                }}
              >
                <option value="">{t('select_department_placeholder')}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nome}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <FaUser className={styles.icon} />
              <select
                className={styles.selectFunc}
                value={funcionario}
                onChange={e => setFuncionario(e.target.value)}
                disabled={!selectedDept}
              >
                <option value="">{t('select_employee_placeholder')}</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grupo 1 */}
          <div className="card-modern" style={{ marginBottom: '20px' }}>
            <h3 className={styles.sectionTitle}><FaUserCheck /> {t('behavioral_criteria')}</h3>
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

          {/* Grupo 2 - Apenas para Docência */}
          {isDocencia && (
            <div className="card-modern">
              <h3 className={styles.sectionTitle} style={{ color: '#1565c0' }}><FaChalkboardTeacher /> {t('technical_criteria')}</h3>
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
            </div>
          )}

          {/* Grupo 3 */}
          <div className="card-modern" style={{ marginTop: '20px' }}>
            <h3 className={styles.sectionTitle} style={{ color: '#f59e0b' }}><FaChartPie /> {t('professional_criteria')}</h3>
            <div className={styles.criteriaList}>
              {Object.entries(grupo3).map(([key, val]) => (
                <SliderItem
                  key={key} attrKey={key} val={val}
                  onChange={handleChangeG3}
                  label={labelsMap[key]}
                  color="#f59e0b" // Laranja
                />
              ))}
            </div>

            <div className={styles.feedbackArea}>
              <h3 className={styles.sectionTitle} style={{ marginTop: '30px', border: 'none' }}>
                <FaComments /> {t('final_opinion')}
              </h3>
              <textarea rows="4" className={styles.textarea} placeholder={t('final_opinion_placeholder')}></textarea>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSave} onClick={async () => {
                if (!selectedDept) return alert(t('alert_select_department'));
                if (!funcionario) return alert(t('alert_select_employee'));

                // Mapear dados para o formato do backend
                const evaluationData = {
                  pontualidade: grupo1.pontualidade,
                  assiduidade: grupo1.assiduidade,
                  adaptacao: grupo1.adaptacao,
                  relacao_colegas: grupo1.relacao_colegas,
                  organizacao: grupo3.organizacao,
                  etica_profissional: grupo3.etica,
                  iniciativa: grupo3.iniciativa,
                  cumprimento_prazos: grupo3.prazos,
                  processo_ensino: isDocencia ? grupo2.ensino_aprendizagem : 0,
                  aperfeicoamento: isDocencia ? grupo2.aperfeicoamento : 0,
                  inovacao: isDocencia ? grupo2.inovacao : 0,
                  responsabilidade: isDocencia ? grupo2.responsabilidade : 0,
                  relacao_humanas: isDocencia ? grupo2.relacao_trabalho : 0,
                  actividades_extras: isDocencia ? grupo2.atividades_extra : 0
                };

                const result = await addHistoryEvent({
                  tipo: 'avaliacao',
                  funcionarioId: parseInt(funcionario),
                  notas: evaluationData
                });

                if (result?.success) {
                  alert(t('alert_success'));
                  navigate('/historicos');
                } else {
                  alert("Erro ao salvar avaliação no servidor.");
                }
              }}><FaSave /> {t('register_evaluation')}</button>
            </div>
          </div>
        </div>

        <div className={styles.summaryColumn}>

          {/* CARD DE INFORMAÇÃO DO USUÁRIO (NOVO) */}
          {selectedEmployee && (
            <div className={styles.userInfoCard}>
              <div className={styles.avatarContainer}>
                <img
                  src={selectedEmployee.foto || 'https://via.placeholder.com/150'}
                  alt="Avatar"
                  className={styles.avatarImg}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.statusBadge}></div>
              </div>
              <h3 className={styles.userName}>{selectedEmployee.nome}</h3>
              <span className={styles.userRole}>{selectedEmployee.cargo}</span>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Departamento</span>
                  <span className={styles.metaValue}>{selectedEmployee.dept}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Admissão</span>
                  <span className={styles.metaValue}>{selectedEmployee.admission || '---'}</span>
                </div>
                <div className={styles.metaItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.metaLabel}>Email</span>
                  <span className={styles.metaValue}>{selectedEmployee.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className={`${styles.chartCard} card-modern`}>
            <div className={styles.chartHeader}><FaChartPie /> {t('analysis_360')}</div>
            <div className={styles.chartBox}>
              <Radar data={radarData} options={RadarOptions} />
            </div>
            <div className={styles.infoBox}>
              <p>{t('analysis_desc_new', { count: isDocencia ? 14 : 8 })}</p>
            </div>
          </div>

          {/* Novo Card de Classificação */}
          <div className="card-modern" style={{ marginTop: '20px', textAlign: 'center', padding: '30px' }}>
            <h3 className={styles.sectionTitle} style={{ justifyContent: 'center', border: 'none' }}>{t('final_result')}</h3>

            <div className={styles.summaryScore} style={{ backgroundColor: qualitativa.color + '20', color: qualitativa.color }}>
              <span>{t('quantitative_classification')}</span>
              <strong>{notaFinal} <small style={{ fontSize: '14px', color: '#64748b' }}>/ 20</small></strong>

              <div style={{ marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
                <span style={{ marginBottom: '5px' }}>{t('qualitative_classification')}</span>
                <div className={styles.qualitativeLabel}>{qualitativa.label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
