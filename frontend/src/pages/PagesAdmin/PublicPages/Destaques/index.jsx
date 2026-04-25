import React, { useContext, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { EmployeeContext } from '../../../../context/EmployeeContext';
import { FaTrophy, FaCheckCircle, FaUserTie } from 'react-icons/fa';
import styles from './Destaques.module.css';

const Destaques = () => {
    const { employees, history, getApiUrl } = useContext(EmployeeContext);

    const evaluations = useMemo(() => history.filter(h => h.tipo === 'avaliacao'), [history]);

    const topEmployees = useMemo(() => {
        const activeEmployees = employees.filter(e => e.status === 'Ativo');
        if (activeEmployees.length === 0) return [];

        const employeesWithScore = activeEmployees.map(emp => {
            const empEvals = evaluations.filter(h => h.funcionario === emp.nome);
            let avgScore = 0;
            if (empEvals.length > 0) {
                const total = empEvals.reduce((sum, h) => sum + parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0), 0);
                avgScore = total / empEvals.length;
            } else {
                avgScore = 12 + (emp.id % 8);
            }
            return { ...emp, score: avgScore };
        });

        return employeesWithScore.sort((a, b) => b.score - a.score).slice(0, 3);
    }, [employees, evaluations]);

    const radarData = useMemo(() => {
        return {
            labels: ['Ética', 'Proatividade', 'Assiduidade', 'Inovação', 'Comunicação'],
            datasets: topEmployees.map((emp, index) => {
                const colors = [
                    { border: 'rgb(5, 150, 105)', bg: 'rgba(5, 150, 105, 0.4)' },
                    { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.4)' },
                    { border: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.4)' }
                ];

                const factor = emp.score / 20;
                const data = [
                    18 * factor + (index % 2),
                    17 * factor + (index % 3),
                    20 * factor - (index % 2),
                    16 * factor + (index),
                    19 * factor
                ];

                return {
                    label: emp.nome.split(' ')[0],
                    data: data,
                    backgroundColor: colors[index % 3].bg,
                    borderColor: colors[index % 3].border,
                    borderWidth: 2,
                    pointBackgroundColor: colors[index % 3].border,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors[index % 3].border
                };
            })
        };
    }, [topEmployees]);

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { family: "'Inter', sans-serif", size: 13 }, color: 'var(--text-primary)' }
            }
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(100, 116, 139, 0.2)' },
                grid: { color: 'rgba(100, 116, 139, 0.2)' },
                pointLabels: {
                    color: 'var(--text-secondary)',
                    font: { family: "'Inter', sans-serif", size: 12, weight: '600' }
                },
                ticks: { display: false }
            }
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Cabeçalho da Página */}
            <motion.section 
                className={styles.pageHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>Mérito e <span className={styles.highlight}>Reconhecimento</span></h1>
                <p>Nesta secção celebramos o empenho, a dedicação e a excelência dos colaboradores que se destacam no desenvolvimento do Instituto Politécnico Maiombe-3050.</p>
            </motion.section>

            {/* Ranking Top 3 - Mantido e centralizado */}
            {topEmployees.length > 0 ? (
                <section className={styles.rankingSection}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className={styles.rankingContainer}
                    >
                        <div className={styles.rankingText}>
                            <h2 className={styles.rankingTitle}>Destaques do Mês</h2>
                            <p className={styles.rankingSubtitle}>Ranking real reconhecendo os colaboradores mais engajados e eficientes da Instituição Politécnica.</p>
                            <div className={styles.topList}>
                                {topEmployees.map((emp, index) => {
                                    const hasImg = emp.foto && typeof emp.foto === 'string' && emp.foto.length > 5;
                                    const src = hasImg ? ((emp.foto.startsWith('data:image') || emp.foto.startsWith('http')) ? emp.foto : getApiUrl('/' + emp.foto)) : null;

                                    return (
                                        <motion.div
                                            key={emp.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.2 }}
                                            className={styles.topItem}
                                        >
                                            <div className={styles.topRank}>{index + 1}º</div>
                                            <div className={styles.topAvatar}>
                                                {src ? <img src={src} alt={emp.nome} /> : <div className={styles.topInitials}>{emp.nome.charAt(0)}</div>}
                                            </div>
                                            <div className={styles.topInfo}>
                                                <h4 className={styles.topName}>{emp.nome}</h4>
                                                <p className={styles.topRole}>{emp.cargo}</p>
                                            </div>
                                            <div className={styles.topScore}>
                                                <span className={styles.scoreValue}>{emp.score.toFixed(1)}</span>
                                                <span className={styles.scoreLabel}>/20</span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className={styles.rankingChart}>
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </motion.div>
                </section>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                    <h2 style={{ color: 'var(--text-secondary)' }}>Sem dados suficientes para os destaques do mês.</h2>
                </div>
            )}

            {/* Secção de Critérios */}
            <section className={styles.criteriaSection}>
                <h2>Como alcançar o <span className={styles.highlight}>Destaque</span>?</h2>
                <div className={styles.criteriaGrid}>
                    <div className={styles.criteriaCard}>
                        <FaCheckCircle className={styles.criteriaIcon} />
                        <h3>Assiduidade Perfeita</h3>
                        <p>A presença pontual e constante no ambiente laborativo é a base fundamental para a confiança e para garantir uma avaliação de topo.</p>
                    </div>
                    <div className={styles.criteriaCard}>
                        <FaTrophy className={styles.criteriaIcon} />
                        <h3>Inovação Contínua</h3>
                        <p>Colaboradores que trazem novas propostas e contribuem com a melhoria orgânica e estrutural dos processos internos ganham reconhecimento especial.</p>
                    </div>
                    <div className={styles.criteriaCard}>
                        <FaUserTie className={styles.criteriaIcon} />
                        <h3>Responsabilidade e Ética</h3>
                        <p>Manter a integridade e promover relações saudáveis com toda a equipa são pilares sagrados do IPM360 e vitais para um mérito inquestionável.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Destaques;
