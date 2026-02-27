import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import {
    FaChartLine,
    FaGraduationCap,
    FaRocket,
    FaLightbulb,
    FaCheckCircle
} from 'react-icons/fa';
import styles from './LandingPage.module.css';
import logo from '../../../assets/images/LogoSistema.jpeg';
import { EmployeeContext } from '../../../context/EmployeeContext';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const features = [
    {
        icon: '📈',
        title: 'Avaliação 360°',
        description: 'Obtenha uma visão completa do desempenho da sua equipe através de avaliações de pares, gestores e autoavaliação.',
    },
    {
        icon: '🎯',
        title: 'Planos de Desenvolvimento',
        description: 'Crie planos de ação personalizados (PDI) baseados nos resultados das avaliações para impulsionar o crescimento.',
    },
    {
        icon: '🤝',
        title: 'Feedbacks Contínuos',
        description: 'Promova uma cultura de transparência com ferramentas para feedbacks estruturados e em tempo real.',
    },
    {
        icon: '📂',
        title: 'Relatórios Inteligentes',
        description: 'Dashboards completos que transformam dados de performance em insights acionáveis para a liderança.',
    },
    {
        icon: '🏁',
        title: 'Gestão de Objetivos',
        description: 'Defina e acompanhe OKRs e metas individuais alinhadas aos objetivos estratégicos da organização.',
    },
    {
        icon: '🏗️',
        title: 'Matriz 9-Box',
        description: 'Identifique talentos e potencias sucessores visualizando o desempenho vs potencial em uma matriz dinâmica.',
    },
];

const suggestions = [
    {
        title: 'Mantenha seu PDI atualizado',
        desc: 'Alinhar suas metas com os objetivos da empresa acelera seu crescimento.',
        icon: <FaCheckCircle />
    },
    {
        title: 'Explore novos cursos',
        desc: 'Use os insights das suas avaliações para focar em hard skills deficientes.',
        icon: <FaCheckCircle />
    }
];

const LandingPage = () => {
    const { employees, history } = useContext(EmployeeContext);

    // Dados de exemplo para o gráfico de evolução (Motivacional)
    const evolutionData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            {
                label: 'Potencial de Crescimento da Organização',
                data: [65, 78, 72, 85, 92, 98],
                fill: true,
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                borderColor: '#059669',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#059669',
            },
        ],
    };

    const skillsData = {
        labels: ['Liderança', 'Técnica', 'Comunicação', 'Proatividade'],
        datasets: [
            {
                data: [80, 70, 90, 85],
                backgroundColor: [
                    '#059669',
                    '#10b981',
                    '#34d399',
                    '#6ee7b7',
                ],
                borderWidth: 0,
            },
        ],
    };

    // Cálculos para Estatísticas Dinâmicas
    const dynamicStats = useMemo(() => {
        const totalEmployees = employees.length;
        const evaluations = history.filter(h => h.tipo === 'avaliacao');
        const totalEvaluations = evaluations.length;

        let avgScore = 0;
        if (totalEvaluations > 0) {
            const sum = evaluations.reduce((acc, h) => {
                return acc + parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0);
            }, 0);
            avgScore = (sum / totalEvaluations).toFixed(1);
        } else {
            avgScore = "15.5";
        }

        const totalEvents = history.length;

        return [
            { label: 'Colaboradores', value: totalEmployees || '42' },
            { label: 'Avaliações', value: totalEvaluations || '128' },
            { label: 'Média Global', value: `${avgScore}/20` },
            { label: 'Engagement', value: '94%' },
        ];
    }, [employees, history]);

    const topEmployees = useMemo(() => {
        const activeEmployees = employees.filter(e => e.status === 'Ativo');
        if (activeEmployees.length === 0) return [];

        const employeesWithScore = activeEmployees.map(emp => {
            const empEvals = history.filter(h => h.funcionario === emp.nome && h.tipo === 'avaliacao');
            let avgScore = 0;
            if (empEvals.length > 0) {
                const total = empEvals.reduce((sum, h) => {
                    return sum + parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0);
                }, 0);
                avgScore = total / empEvals.length;
            } else {
                avgScore = 15 + (emp.id % 5);
            }
            return { ...emp, score: avgScore };
        });

        return employeesWithScore.sort((a, b) => b.score - a.score).slice(0, 3);
    }, [employees, history]);

    const chartData = {
        labels: topEmployees.map(e => e.nome.split(' ')[0]),
        datasets: [
            {
                label: 'Índice de Performance (0-20)',
                data: topEmployees.map(e => e.score),
                backgroundColor: [
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(52, 211, 153, 0.8)',
                ],
                borderColor: [
                    'rgb(5, 150, 105)',
                    'rgb(16, 185, 129)',
                    'rgb(52, 211, 153)',
                ],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 20,
                grid: { color: '#f1f5f9' },
                ticks: { font: { family: "'Inter', sans-serif" } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Inter', sans-serif", weight: '600' } }
            }
        },
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const containerVariants = {
        initial: {},
        whileInView: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/" className={styles.logoContainer}>
                    <img src={logo} alt="IPM360 Logo" className={styles.logoImage} />
                    <span className={styles.logoText}>IPM360</span>
                </Link>
                <nav className={styles.nav}>
                    <Link to="/login" className={`${styles.btn} ${styles.btnRegister}`}>Entrar</Link>
                </nav>
            </header>

            <section className={styles.hero}>
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={styles.heroContent}
                >
                    <h1 className={styles.heroTitle}>
                        Gestão de Performance <span className={styles.highlight}>Simples e Inteligente</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Transforme o potencial da sua equipe com feedbacks contínuos, inteligência de dados e planos de desenvolvimento personalizados.
                    </p>
                    <div className={styles.ctaContainerHero}>
                        <Link to="/login" className={styles.btnCtaPrimary}>Começar Agora</Link>
                    </div>
                </motion.div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={styles.heroBadge}
                >
                    ✨ Experiência Premium IPM360
                </motion.div>
            </section>

            {/* Insights Section - Merged from User Page */}
            <section className={styles.insightsSection}>
                <div className={styles.sectionHeader}>
                    <motion.h2 {...fadeInUp}>Transforme Dados em <span className={styles.highlight}>Crescimento</span></motion.h2>
                    <p>Visão clara do desempenho da sua organização.</p>
                </div>

                <div className={styles.insightsGrid}>
                    <motion.div {...fadeInUp} className={styles.insightCard}>
                        <div className={styles.insightIcon}><FaChartLine /></div>
                        <h3>Evolução da Equipe</h3>
                        <p>Acompanhe a curva de crescimento e o impacto das ações de desenvolvimento.</p>
                        <div className={styles.chartMini}>
                            <Line data={evolutionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>

                    <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className={styles.insightCard}>
                        <div className={styles.insightIcon}><FaGraduationCap /></div>
                        <h3>Matriz de Competências</h3>
                        <p>Identifique os pontos fortes e as áreas que necessitam de treinamento estratégico.</p>
                        <div className={styles.chartMini}>
                            <Doughnut data={skillsData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {dynamicStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            {...fadeInUp}
                            transition={{ delay: index * 0.1 }}
                            className={styles.statCard}
                        >
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Motivation Section - Merged from User Page */}
            <section className={styles.motivationSection}>
                <div className={styles.motivationContainer}>
                    <div className={styles.motivationText}>
                        <motion.h2 {...fadeInUp} className={styles.motiTitle}>Potencialize sua <span className={styles.highlight}>Organização</span></motion.h2>
                        <ul className={styles.motiList}>
                            <motion.li {...fadeInUp} transition={{ delay: 0.1 }}>
                                <FaRocket className={styles.motiIcon} />
                                <div>
                                    <h4>Visibilidade 360°</h4>
                                    <p>Garanta que os melhores talentos sejam reconhecidos através de meritocracia transparente.</p>
                                </div>
                            </motion.li>
                            <motion.li {...fadeInUp} transition={{ delay: 0.2 }}>
                                <FaLightbulb className={styles.motiIcon} />
                                <div>
                                    <h4>Decisões Baseadas em Dados</h4>
                                    <p>Tome decisões estratégicas de RH com base em relatórios precisos de performance.</p>
                                </div>
                            </motion.li>
                        </ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={styles.suggestionsCard}
                    >
                        <h3>💡 Foco no Sucesso</h3>
                        <div className={styles.sugList}>
                            {suggestions.map((sug, i) => (
                                <div key={i} className={styles.sugItem}>
                                    <div className={styles.sugIcon}>{sug.icon}</div>
                                    <div>
                                        <strong>{sug.title}</strong>
                                        <p>{sug.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {topEmployees.length > 0 && (
                <section className={styles.rankingSection}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className={styles.rankingContainer}
                    >
                        <div className={styles.rankingText}>
                            <h2 className={styles.rankingTitle}>Destaques do Mês</h2>
                            <p className={styles.rankingSubtitle}>Reconhecimento dos colaboradores com desempenho excepcional na última avaliação.</p>
                            <div className={styles.topList}>
                                {topEmployees.map((emp, index) => (
                                    <motion.div
                                        key={emp.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.2 }}
                                        className={styles.topItem}
                                    >
                                        <div className={styles.topRank}>{index + 1}º</div>
                                        <div className={styles.topAvatar}>
                                            {emp.foto ? <img src={emp.foto} alt={emp.nome} /> : <div className={styles.topInitials}>{emp.nome.charAt(0)}</div>}
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
                                ))}
                            </div>
                        </div>
                        <div className={styles.rankingChart}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </motion.div>
                </section>
            )}

            <section className={styles.features}>
                <motion.h2 {...fadeInUp} className={styles.featuresTitle}>
                    Funcionalidades que Impulsionam Resultados
                </motion.h2>
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    className={styles.featuresGrid}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={styles.featureCard}
                        >
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <h3 className={styles.featureName}>{feature.title}</h3>
                            <p className={styles.featureDesc}>{feature.description}</p>
                            <div className={styles.cardGlow}></div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.logoContainer} style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <span className={styles.logoText} style={{ color: 'white' }}>IPM360°</span>
                    </div>
                    <p className={styles.footerText}>
                        Liderando a transformação da cultura organizacional através da transparência e mérito.
                    </p>
                </div>
                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()} IPM360. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
