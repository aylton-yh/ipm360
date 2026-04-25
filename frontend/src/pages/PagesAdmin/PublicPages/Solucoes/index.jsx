import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaGraduationCap, FaRocket, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import styles from './Solucoes.module.css';

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

const Solucoes = () => {
    return (
        <div className={styles.pageContainer}>
            <motion.section 
                className={styles.pageHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>Nossas <span className={styles.highlight}>Soluções</span></h1>
                <p>Conheça as ferramentas e funcionalidades inovadoras projetadas para otimizar o desempenho, gerir talentos e desenvolver a nossa equipe laborativa.</p>
            </motion.section>

            <section className={styles.features}>
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
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
};

export default Solucoes;
