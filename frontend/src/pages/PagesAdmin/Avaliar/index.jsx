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
      suggestedMax: 20,
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
  const { addHistoryEvent, employees, departments, history } = useContext(EmployeeContext);
  const { hasPermission } = useContext(AuthContext);
  const [selectedDept, setSelectedDept] = useState('');
  const [funcionario, setFuncionario] = useState('');

  // Grupo 1: Comportamental (4 itens)
  const [grupo1, setGrupo1] = useState({
    pontualidade: 10,
    assiduidade: 10,
    adaptacao: 10,
    relacao_colegas: 10,
  });

  // Grupo 2: Técnico-Pedagógico (6 itens)
  const [grupo2, setGrupo2] = useState({
    ensino_aprendizagem: 10,
    aperfeicoamento: 10,
    inovacao: 10,
    responsabilidade: 10,
    relacao_trabalho: 10,
    atividades_extra: 10,
  });

  // Grupo 3: Profissional (4 itens)
  const [grupo3, setGrupo3] = useState({
    organizacao: 10,
    etica: 10,
    iniciativa: 10,
    prazos: 10,
  });

  // Faltas (Apenas Docência - max 24)
  const [faltas, setFaltas] = useState(0);

  // Período de Avaliação (Persistido no localStorage)
  const [periodo, setPeriodo] = useState(() => {
    return localStorage.getItem('ipm360_avaliacao_periodo') || 'Mensal';
  });

  // Salvar período sempre que mudar
  React.useEffect(() => {
    localStorage.setItem('ipm360_avaliacao_periodo', periodo);
  }, [periodo]);

  const currentDate = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });

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
  const selectedDeptObj = departments.find(d => d.id === parseInt(selectedDept));
  const isDocencia = selectedDeptObj?.nome === 'Docência' || selectedEmployee?.dept === 'Docência';

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

  // Cálculo da Nota Final (Escala 0-20 baseada na média das notas)
  const calcularTotal = () => {
    const soma1 = Object.values(grupo1).reduce((a, b) => a + b, 0);
    const soma2 = isDocencia ? Object.values(grupo2).reduce((a, b) => a + b, 0) : 0;
    const soma3 = Object.values(grupo3).reduce((a, b) => a + b, 0);

    // Opcional: A falta pode abater a nota final aqui se desejado.
    // Ex: -0.5 valores por cada falta acima de X.
    let abateCarga = 0;
    if (isDocencia && faltas > 0) {
      // Exemplo simples: penaliza a nota total em proporção às faltas
      // 24 faltas = perda severa (ex: -5 valores finais, configurável caso o IP estabeleça a regra)
      // abateCarga = (faltas / 24) * 2;
    }

    const somaTotal = soma1 + soma2 + soma3;
    const count = isDocencia ? 14 : 8; // 4 + 6 + 4 = 14 para docência.

    let media = (somaTotal / count) - abateCarga;
    if (media < 0) media = 0;
    if (media > 20) media = 20;

    return media;
  };

  const notaFinalNum = calcularTotal();
  const notaFinal = notaFinalNum.toFixed(1);

  const allEvaluations = history.filter(h => h.evento === 'avaliacao');
  const sumPast = allEvaluations.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const countPast = allEvaluations.length;

  // Incluir a nota atual no cálculo da média geral em tempo real
  const mediaGeral = ((sumPast + notaFinalNum) / (countPast + 1)).toFixed(1);

  const getQualitativa = (val) => {
    if (val < 10) return { label: 'Mau', color: '#ef4444' };
    if (val < 14) return { label: 'Razoável', color: '#f59e0b' };
    if (val < 18) return { label: 'Bom', color: '#3b82f6' };
    return { label: 'Muito Bom', color: '#10b981' };
  };

  const qualitativa = getQualitativa(notaFinal);

  // Funções de Faltas
  const getFaltasQualitativa = (total) => {
    if (total >= 18) return { label: 'Mal', color: '#ef4444' };
    if (total >= 14) return { label: 'Suficiente', color: '#f59e0b' };
    if (total >= 10) return { label: 'Bom', color: '#3b82f6' };
    if (total >= 6) return { label: 'Muito Bom', color: '#10b981' };
    return { label: 'Excelente', color: '#059669' };
  };

  // Calcular faltas acumuladas no histórico para o funcionário selecionado
  const faltasAnteriores = history
    .filter(h => h.funcionarioId === parseInt(funcionario) || h.id_funcionario === parseInt(funcionario))
    .reduce((acc, curr) => acc + (curr.faltas || 0), 0);

  const totalFaltasComNova = faltasAnteriores + faltas;
  const faltasQuali = getFaltasQualitativa(faltas);

  // Componente auxiliar de Slider
  const SliderItem = ({ attrKey, val, onChange, label, color }) => {
    // Cálculo de cor de fundo baseado no valor (0-20)
    const getBgColor = (v) => {
      const alpha = 0.08 + (v * 0.01); // Aumenta opacidade com a nota
      if (v <= 9) return `rgba(239, 68, 68, ${alpha})`; // Vermelho
      if (v <= 13) return `rgba(245, 158, 11, ${alpha})`; // Amarelo/Laranja
      return `rgba(34, 197, 94, ${alpha})`; // Verde
    };

    return (
      <div
        className={styles.criteriaItem}
        style={{
          backgroundColor: getBgColor(val),
          borderLeft: `4px solid ${val >= 14 ? '#22c55e' : val >= 10 ? '#f59e0b' : '#ef4444'}`,
          transition: 'all 0.3s ease'
        }}
      >
        <div className={styles.criteriaHeader}>
          <span className={styles.criteriaName}>{label}</span>
          <span className={styles.criteriaValue}>{val} / 20</span>
        </div>
        <input
          type="range" min="0" max="20" step="1" value={val}
          className={styles.rangeInput}
          style={{ accentColor: color }}
          onChange={(e) => onChange(attrKey, e.target.value)}
        />
        <div className={styles.scaleLabels}><span>0</span><span>20</span></div>
      </div>
    );
  };



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
          <p style={{ color: '#64748b', marginTop: '5px' }}>{t('page_subtitle')}</p>
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

          <div className="card-modern" style={{ marginBottom: '20px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Tempo de Avaliação</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Diário">Diário</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div style={{
              padding: '15px 20px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Data da Avaliação</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#3b82f6' }}>{currentDate}</span>
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
            <div className="card-modern" style={{ marginBottom: '20px' }}>
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
                  actividades_extras: isDocencia ? grupo2.atividades_extra : 0,
                  faltas: isDocencia ? faltas : 0,
                  periodo: periodo
                };

                if (totalFaltasComNova >= 24) {
                  return alert("Erro: O funcionário atingiu ou ultrapassará o limite de 24 faltas acumuladas. Não é possível salvar esta avaliação.");
                }

                if (selectedEmployee && selectedEmployee.status !== 'Ativo') {
                  return alert(`Bloqueio de Avaliação: Não é possível avaliar ${selectedEmployee.nome} pois o colaborador está com status "${selectedEmployee.status}". 
Funcionários em Férias, Suspensos ou Inativos não podem receber novas avaliações de desempenho. 
Altere o status para "Ativo" se desejar proceder com a avaliação.`);
                }

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
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Email</span>
                  <span className={styles.metaValue}>{selectedEmployee.email}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Faltas Acumuladas</span>
                  <span className={styles.metaValue} style={{ color: faltasAnteriores >= 20 ? '#ef4444' : '#334155' }}>
                    {faltasAnteriores} / 24
                  </span>
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

          {/* Novo Card de Faltas - Lado Direito (Apenas Docência) */}
          {isDocencia && (
            <div className="card-modern" style={{ marginTop: '20px', padding: '25px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaChartPie style={{ color: '#8b5cf6' }} /> Carga Tempo / Faltas
                </h3>
                <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Max: 24</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', color: '#64748b' }}>Insira o número de faltas (0 a 24)</label>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: faltasQuali.color + '20',
                    color: faltasQuali.color,
                    border: `1px solid ${faltasQuali.color}`
                  }}>
                    {faltasQuali.label}
                  </div>
                </div>

                <input
                  type="number"
                  min="0"
                  max="24"
                  value={faltas}
                  onChange={(e) => {
                    let v = parseInt(e.target.value) || 0;
                    if (v < 0) v = 0;
                    if (v > 24) v = 24;
                    setFaltas(v);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: totalFaltasComNova >= 24 ? '#ef4444' : '#1e293b'
                  }}
                />

                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  Total Acumulado: <strong>{totalFaltasComNova}</strong> / 24
                </div>

                {totalFaltasComNova >= 24 && (
                  <div style={{
                    color: '#ef4444',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginTop: '5px',
                    padding: '10px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '#64748b'
                  }}>
                    LIMITE TOTAL ATINGIDO! O funcionário já possui {faltasAnteriores} faltas históricas e o limite máximo permitido é 24.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Novo Card de Classificação */}
          <div className="card-modern" style={{ marginTop: '20px', textAlign: 'center', padding: '30px' }}>
            <h3 className={styles.sectionTitle} style={{ justifyContent: 'center', border: 'none' }}>{t('final_result')}</h3>

            <div className={styles.summaryScore} style={{ backgroundColor: qualitativa.color + '20', color: qualitativa.color }}>
              <span>Média Final</span>
              <strong>{notaFinal} <small style={{ fontSize: '14px', color: '#64748b' }}>/ 20</small></strong>

              <div style={{ marginTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
                <span style={{ marginBottom: '5px' }}>{t('qualitative_classification')}</span>
                <div className={styles.qualitativeLabel}>{qualitativa.label}</div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '15px' }}>
                <span style={{ marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>Média Geral dos Funcionários</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{mediaGeral} / 20</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
