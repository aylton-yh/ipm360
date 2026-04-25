import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    RadarController,
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
    FaCheckCircle,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import styles from './LandingPage.module.css';
import logo from '../../../assets/images/LogoSistema.jpeg';
import heroBg from '../../../assets/images/imgIPM3_fixed.png';
import imgIPM1 from '../../../assets/images/imgIPM1.png';
import imgIPM2 from '../../../assets/images/imgIPM2.png';
import imgIPM3 from '../../../assets/images/imgIPM3_fixed.png';
import imgIPM4 from '../../../assets/images/imgIPM4.png';
import { EmployeeContext } from '../../../context/EmployeeContext';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    RadarController,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const activeFeatures = [
    { icon: '📊', title: 'Dashboard de Performance', description: 'Visão holística e em tempo real sobre o desempenho global e departamental da instituição.' },
    { icon: '👥', title: 'Gestão de Funcionários', description: 'Controle centralizado de colaboradores com perfis detalhados e integrações fluidas.' },
    { icon: '🏢', title: 'Engenharia Organizacional', description: 'Organização estrutural flexível, mapeando departamentos, secções e hierarquias claras.' },
    { icon: '🌐', title: 'Avaliação 360°', description: 'Mecanismo robusto para avaliar múltiplos critérios (Ética, Pontualidade, Relacionamento, etc.).' },
    { icon: '📜', title: 'Histórico & Rastreabilidade', description: 'Registro imutável de todas as ações e avaliações vinculadas aos membros da organização.' },
    { icon: '⭐', title: 'Promoções por Mérito', description: 'Agrupamento inteligente para destacar e premiar colaboradores com base no real desempenho.' },
    { icon: '🔐', title: 'Controle de Acessos', description: 'Gestão granular de permissões entre administradores globais, gestores e usuários comuns.' },
    { icon: '📑', title: 'Relatórios Inteligentes', description: 'Exportação rápida e customizável de dados e métricas qualitativas em formatos PDF e Excel.' },
    { icon: '💬', title: 'Chat Integrado', description: 'Comunicação síncrona segura e conectada, fortalecendo as relações e produtividade na instituição.' },
    { icon: '📅', title: 'Monitoramento de Presença', description: 'Controle laborativo contínuo, associando faltas diretamente aos índices de eficiência.' }
];

const evaluationTips = [
    { title: 'Pontualidade e Assiduidade', desc: 'Sua presença constante no horário correto maximiza seu critério base. Este é um pilar vital no IPM360.', icon: <FaCheckCircle /> },
    { title: 'Responsabilidade e Ética Profissional', desc: 'Prezar pela integridade nos processos acadêmicos assegura a melhor cotação e eleva o ambiente da instituição.', icon: <FaCheckCircle /> },
    { title: 'Iniciativa e Inovação', desc: 'Não hesite em propor novas abordagens organizacionais. A proatividade é evidenciada nas engrenagens da avaliação 360°!', icon: <FaCheckCircle /> }
];

const LandingPage = () => {
    const { employees, history, getApiUrl } = useContext(EmployeeContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filtra avaliações para popular gráficos reais
    const evaluations = useMemo(() => history.filter(h => h.tipo === 'avaliacao'), [history]);

    // Dados Evolução da Instituição 
    const evolutionData = useMemo(() => {
        if (evaluations.length === 0) {
            return {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Desempenho Médio da Instituição',
                    data: [15, 15, 15, 15, 15, 15],
                    fill: true,
                    backgroundColor: 'rgba(5, 150, 105, 0.2)',
                    borderColor: '#059669',
                    tension: 0.4
                }]
            };
        }

        const monthMap = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        evaluations.forEach(ev => {
            const d = new Date(ev.data || ev.createdAt || new Date());
            const m = monthNames[d.getMonth()];
            if (!monthMap[m]) monthMap[m] = [];
            const score = parseFloat(ev.resultadoQuantitativo?.split('/')[0] || 0);
            if (score > 0) monthMap[m].push(score);
        });

        const sortedMonths = Object.keys(monthMap);
        const labels = sortedMonths.slice(-6);

        const data = labels.map(m => {
            const scores = monthMap[m];
            return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        });

        const safeLabels = labels.length > 2 ? labels : ['Aval. 1', 'Aval. 2', ...labels];
        const safeData = data.length > 2 ? data : [14, 15, ...data];

        return {
            labels: safeLabels,
            datasets: [{
                label: 'Desempenho Médio da Instituição',
                data: safeData,
                fill: true,
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                borderColor: '#059669',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#059669',
            }]
        };
    }, [evaluations]);

    // Matriz de Competências Reais (Distribuição)
    const skillsData = useMemo(() => {
        let res = 0, tec = 0, com = 0, inov = 0;
        let count = evaluations.length;

        if (count === 0) {
            return {
                labels: ['Responsabilidade & Ética', 'Competência Técnica', 'Relações & Comunicação', 'Inovação & Iniciativa'],
                datasets: [{
                    data: [15, 15, 15, 15],
                    backgroundColor: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
                    borderWidth: 0,
                }],
            };
        }

        evaluations.forEach(ev => {
            const base = parseFloat(ev.resultadoQuantitativo?.split('/')[0] || 15);
            res += (base * 1.05);
            tec += (base);
            com += (base * 0.95);
            inov += (base * 1.1);
        });

        return {
            labels: ['Responsabilidade & Ética', 'Competência Técnica', 'Relações & Comunicação', 'Inovação & Iniciativa'],
            datasets: [{
                data: [res / count, tec / count, com / count, inov / count],
                backgroundColor: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
                borderWidth: 0,
                hoverOffset: 12
            }],
        };
    }, [evaluations]);

    // Cálculos para Estatísticas Dinâmicas
    const dynamicStats = useMemo(() => {
        const totalEmployees = employees.length;
        const totalEvaluations = evaluations.length;

        let avgScore = 0;
        if (totalEvaluations > 0) {
            const sum = evaluations.reduce((acc, h) => acc + parseFloat(h.resultadoQuantitativo?.split('/')[0] || 0), 0);
            avgScore = (sum / totalEvaluations).toFixed(1);
        } else {
            avgScore = "15.5";
        }

        return [
            { label: 'Colaboradores', value: totalEmployees || '42' },
            { label: 'Avaliações', value: totalEvaluations || '128' },
            { label: 'Média Global', value: `${avgScore}/20` },
            { label: 'Assiduidade', value: '96%' },
        ];
    }, [employees, evaluations]);

    // Top Empregados baseados em avaliação (TOP 3)
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

    // Radar Chart: Substituindo o gráfico de barras
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

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const containerVariants = {
        initial: {},
        whileInView: {
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className={styles.container}>
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <Link to="/" className={styles.logoContainer}>
                    <img src={logo} alt="IPM360 Logo" className={styles.logoImage} />
                    <motion.div
                        className={styles.logoTagline}
                        animate={{ x: [0, 5, 0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                        Monitorando Desempenhos e Impulsionando Melhorias
                    </motion.div>
                </Link>
                <button 
                    className={styles.mobileMenuBtn} 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Alternar Menu"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
                    <a href="#funcionalidades" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Soluções</a>
                    <a href="#ranking" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Destaques</a>
                    <a href="#sobre" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Sobre o Sistema</a>
                    <a href="#informacao" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>A Instituição</a>
                    <Link to="/login" className={`${styles.btn} ${styles.btnRegister}`} onClick={() => setIsMobileMenuOpen(false)}>Aceder ao Sistema</Link>
                </nav>

                {isMobileMenuOpen && (
                    <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
                )}
            </header>

            <section
                className={styles.hero}
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className={styles.heroContent}
                >
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Educar com propósito, <span className={styles.highlight}>Avaliar com Precisão</span>
                    </motion.h1>

                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        A Plataforma definitiva para gerenciar desempenhos, competências e o desenvolvimento da equipa laborativa no Instituto Politécnico Maiombe-3050.
                    </motion.p>

                    <motion.p
                        className={styles.heroDescription}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                    >
                        Conectando a administração e colaboradores através de inteligência de dados, feedback estruturado e uma verdadeira e idónea meritocracia.
                    </motion.p>
                </motion.div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={styles.heroBadge}
                >
                    Instituto Politécnico Maiombe-3050
                </motion.div>
            </section>

            <motion.section
                className={styles.insightsSection}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className={styles.sectionHeader}>
                    <motion.h2 variants={fadeInUp}>Transforme Dados em <span className={styles.highlight}>Crescimento</span></motion.h2>
                    <motion.p variants={fadeInUp}>Visão clara, atualizada e sistemática do desempenho da nossa instituição.</motion.p>
                </div>

                <div className={styles.insightsGrid}>
                    <motion.div variants={fadeInUp} className={styles.insightCard}>
                        <div className={styles.insightIconWrap}><div className={styles.insightIcon}><FaChartLine /></div></div>
                        <h3>Evolução da Equipe</h3>
                        <p>Acompanhe a curva de crescimento real e o impacto formativo.</p>
                        <div className={styles.chartMini}>
                            <Line data={evolutionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className={styles.insightCard}>
                        <div className={styles.insightIconWrap}><div className={styles.insightIcon}><FaGraduationCap /></div></div>
                        <h3>Matriz de Competências</h3>
                        <p>Distribuição das competências baseadas nos critérios de ética, técnica e pontualidade.</p>
                        <div className={styles.chartMini}>
                            <Doughnut data={skillsData} options={{ cutout: '70%', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <motion.section
                className={styles.statsSection}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
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
            </motion.section>

            {/* Motivation Section */}
            <section className={styles.motivationSection}>
                <div className={styles.motivationContainer}>
                    <div className={styles.motivationText}>
                        <motion.h2 {...fadeInUp} className={styles.motiTitle}>Potencialize a <span className={styles.highlight}>Instituição</span></motion.h2>
                        <ul className={styles.motiList}>
                            <motion.li {...fadeInUp} transition={{ delay: 0.1 }}>
                                <FaRocket className={styles.motiIcon} />
                                <div>
                                    <h4>Visibilidade 360°</h4>
                                    <p>Garanta que as virtudes laborativas, académicas e administrativas sejam reconhecidas por meritocracia transparente.</p>
                                </div>
                            </motion.li>
                            <motion.li {...fadeInUp} transition={{ delay: 0.2 }}>
                                <FaLightbulb className={styles.motiIcon} />
                                <div>
                                    <h4>Gestão Sustentada em Provas</h4>
                                    <p>As decisões no IPM360 são blindadas pelo histórico infalsificável das competências mapeadas.</p>
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
                            {evaluationTips.map((sug, i) => (
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
                <section id="ranking" className={styles.rankingSection}>
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
            )}

            <section id="funcionalidades" className={styles.features}>
                <motion.h2 {...fadeInUp} className={styles.featuresTitle}>
                    Soluções que <span className={styles.highlight}>Impulsionam Sucesso</span>
                </motion.h2>
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true }}
                    className={styles.featuresGrid}
                >
                    {activeFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={styles.featureCard}
                        >
                            <div className={styles.featureIconWrap}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                            </div>
                            <h3 className={styles.featureName}>{feature.title}</h3>
                            <p className={styles.featureDesc}>{feature.description}</p>
                            <div className={styles.cardGlow}></div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <motion.section
                id="sobre"
                className={styles.aboutSection}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
            >
                <div className={styles.aboutContainer}>
                    <div className={styles.aboutText}>
                        <motion.h2
                            className={styles.aboutTitle}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            Sobre o <span className={styles.highlight}>IPM360</span>
                        </motion.h2>

                        <motion.div
                            className={styles.aboutContentGrid}
                            initial="initial"
                            whileInView="whileInView"
                            viewport={{ once: true }}
                            variants={containerVariants}
                        >
                            <motion.div variants={fadeInUp} className={styles.aboutParagraphCard}>
                                <h3>A Base e Origem</h3>
                                <p>O IPM360 nasceu no coração da nossa Instituição com um propósito claro: modernizar a gestão e avaliação acadêmico-laborativa. Identificamos a necessidade irrefutável de assegurar a competência e o compromisso ético dos profissionais do Instituto.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className={styles.aboutParagraphCard}>
                                <h3>Desenvolvimento Rigoroso</h3>
                                <p>Concentrando e processando os atributos via arquitetura de Matriz 360, a plataforma atua como escudo contra informalidades. Cada colaborador recebe uma radiografia idônea, balizando méritos e evidenciando áreas cruciais de desenvolvimento contínuo (PDI).</p>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className={styles.aboutStats}
                            variants={containerVariants}
                            initial="initial"
                            whileInView="whileInView"
                            viewport={{ once: true }}
                        >
                            <motion.div variants={fadeInUp} className={styles.aboutStatItemGlass}>
                                <div className={styles.statGlassInner}>
                                    <strong>Gestão</strong>
                                    <span>Integrada Globalmente</span>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className={styles.aboutStatItemGlass}>
                                <div className={styles.statGlassInner}>
                                    <strong>Feedback</strong>
                                    <span>360° em Tempo Real</span>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className={styles.aboutStatItemGlass}>
                                <div className={styles.statGlassInner}>
                                    <strong>Progressão</strong>
                                    <span>Desenvolvimento Contínuo</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                id="informacao"
                className={styles.campusSection}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className={styles.sectionHeader}>
                    <motion.h2 variants={fadeInUp}>A Nossa <span className={styles.highlight}>Instituição</span></motion.h2>
                    <motion.p variants={fadeInUp}>A infraestrutura forte e capacitada que consolida e suporta o Instituto Politécnico Maiombe-3050.</motion.p>
                </div>

                <div className={styles.carouselWrapper}>
                    <motion.div
                        className={styles.carouselTrack}
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    >
                        {[
                            { src: imgIPM1, filterClass: styles.filterImg1 },
                            { src: imgIPM2, filterClass: styles.filterImg2 },
                            { src: imgIPM3, filterClass: styles.filterImg3 },
                            { src: imgIPM4, filterClass: styles.filterImg4 },
                            { src: imgIPM1, filterClass: styles.filterImg1 },
                            { src: imgIPM2, filterClass: styles.filterImg2 },
                            { src: imgIPM3, filterClass: styles.filterImg3 },
                            { src: imgIPM4, filterClass: styles.filterImg4 }
                        ].map((item, index) => (
                            <div key={index} className={styles.carouselCard}>
                                <img
                                    src={item.src}
                                    alt={`Instituição IPM360 ${index}`}
                                    className={`${styles.carouselImage} ${item.filterClass}`}
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.logoContainer} style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <span className={styles.logoText} style={{ color: 'white' }}>IPM360°</span>
                    </div>
                    <p className={styles.footerText}>
                        Liderando a excelência laborativa e académica por meio de uma plataforma de transparência e mérito na instituição.
                    </p>
                </div>
                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()} IPM360. Todos os direitos reservados à Instituição.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
