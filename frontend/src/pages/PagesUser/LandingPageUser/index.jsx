import React from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    FaRocket,
    FaLightbulb,
    FaChartLine,
    FaGraduationCap,
    FaArrowRight,
    FaCheckCircle
} from 'react-icons/fa';
import styles from './LandingPageUser.module.css';
import logo from '../../../assets/images/logoSistema.jpeg';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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

const LandingPageUser = () => {
    // Dados de exemplo para o gráfico de evolução (Motivacional)
    const evolutionData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            {
                label: 'Seu Potencial de Crescimento',
                data: [65, 78, 72, 85, 92, 98],
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#2563eb',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb',
            },
        ],
    };

    const skillsData = {
        labels: ['Liderança', 'Técnica', 'Comunicação', 'Proatividade'],
        datasets: [
            {
                data: [80, 70, 90, 85],
                backgroundColor: [
                    '#2563eb',
                    '#60a5fa',
                    '#93c5fd',
                    '#3b82f6',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <Link to="/user" className={styles.logoContainer}>
                    <img src={logo} alt="IPM360 Logo" className={styles.logoImage} />
                </Link>
                <nav className={styles.nav}>
                    <Link to="/" className={`${styles.btn} ${styles.btnAdminPage}`}>Página Admin</Link>
                    <Link to="/user/login" className={`${styles.btn} ${styles.btnLogin}`}>
                        Login
                    </Link>
                    <Link to="/user/cadastro" className={`${styles.btn} ${styles.btnRegister}`}>
                        Cadastrar-se
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Sua Carreira, <span className={styles.highlight}>Nossa Missão</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        O IPM360 não é apenas uma ferramenta de avaliação. É o seu mapa para o sucesso,
                        onde cada feedback é um degrau para a sua melhor versão profissional.
                    </p>
                    <div className={styles.ctaContainer}>
                        <Link to="/user/login" className={styles.btnCtaPrimary}>
                            Ver Meu Desempenho <FaArrowRight style={{ marginLeft: '10px' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Motivation & Insights Section */}
            <section className={styles.insightsSection}>
                <div className={styles.sectionHeader}>
                    <h2>Transforme Dados em <span className={styles.textBlue}>Crescimento</span></h2>
                    <p>Entenda como nossa plataforma impulsiona sua jornada na organização.</p>
                </div>

                <div className={styles.insightsGrid}>
                    <div className={styles.insightCard}>
                        <div className={styles.insightIcon}><FaChartLine /></div>
                        <h3>Evolução Contínua</h3>
                        <p>Acompanhe sua curva de aprendizado e veja o impacto do seu esforço ao longo dos meses.</p>
                        <div className={styles.chartMini}>
                            <Line data={evolutionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>

                    <div className={styles.insightCard}>
                        <div className={styles.insightIcon}><FaGraduationCap /></div>
                        <h3>Mapa de Competências</h3>
                        <p>Saiba exatamente onde você brilha e quais áreas precisam de mais brilho.</p>
                        <div className={styles.chartMini}>
                            <Doughnut data={skillsData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* System Benefits - Motivation List */}
            <section className={styles.motivationSection}>
                <div className={styles.motivationContainer}>
                    <div className={styles.motivationText}>
                        <h2 className={styles.motiTitle}>Por que usar o <span className={styles.textBlue}>IPM360</span>?</h2>
                        <ul className={styles.motiList}>
                            <li>
                                <FaRocket className={styles.motiIcon} />
                                <div>
                                    <h4>Visibilidade Total</h4>
                                    <p>Garanta que seus resultados e esforços sejam vistos por toda a liderança de forma justa.</p>
                                </div>
                            </li>
                            <li>
                                <FaLightbulb className={styles.motiIcon} />
                                <div>
                                    <h4>Clareza de Propósito</h4>
                                    <p>Entenda o que a empresa espera de você e como você pode superar essas expectativas.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.suggestionsCard}>
                        <h3>💡 Dicas para o seu Sucesso</h3>
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
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.logoContainer} style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <span className={styles.logoText} style={{ color: 'white' }}>IPM360°</span>
                    </div>
                    <p className={styles.footerText}>
                        Cuidando do seu futuro, hoje.
                    </p>
                </div>
                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()} IPM360. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default LandingPageUser;
