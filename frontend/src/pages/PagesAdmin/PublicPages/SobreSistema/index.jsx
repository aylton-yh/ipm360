import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLightbulb, FaCheckCircle, FaShieldAlt, FaChartBar, FaUserShield } from 'react-icons/fa';
import styles from './SobreSistema.module.css';

const evaluationTips = [
    { title: 'Pontualidade e Assiduidade', desc: 'Sua presença constante no horário correto maximiza seu critério base. Este é um pilar vital no IPM360.', icon: <FaCheckCircle /> },
    { title: 'Responsabilidade e Ética Profissional', desc: 'Prezar pela integridade nos processos acadêmicos assegura a melhor cotação e eleva o ambiente da instituição.', icon: <FaCheckCircle /> },
    { title: 'Iniciativa e Inovação', desc: 'Não hesite em propor novas abordagens organizacionais. A proatividade é evidenciada nas engrenagens da avaliação 360°!', icon: <FaCheckCircle /> }
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

const SobreSistema = () => {
    return (
        <div className={styles.pageContainer}>
            <motion.section 
                className={styles.pageHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>Sobre o <span className={styles.highlight}>Sistema IPM360</span></h1>
                <p>A plataforma definitiva que revoluciona a gestão e avaliação de desempenho, entregando transparência, meritocracia e dados em tempo real.</p>
            </motion.section>

            <section className={styles.aboutSection}>
                <div className={styles.aboutContainer}>
                    <div className={styles.aboutText}>
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
            </section>

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

            <motion.section 
                className={styles.methodologySection}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className={styles.methodologyContainer}>
                    <motion.h2 variants={fadeInUp} className={styles.sectionTitleCenter}>Metodologia <span className={styles.highlight}>IPM360</span></motion.h2>
                    <div className={styles.methodologyGrid}>
                        <motion.div variants={fadeInUp} className={styles.methodologyCard}>
                            <FaChartBar className={styles.methIcon} />
                            <h4>Avaliação Quantitativa</h4>
                            <p>Utilizamos algoritmos de precisão para ponderar índices de produtividade, assiduidade e cumprimento de metas institucionais.</p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className={styles.methodologyCard}>
                            <FaUserShield className={styles.methIcon} />
                            <h4>Feedback Qualitativo</h4>
                            <p>O sistema processa avaliações comportamentais baseadas em ética, relacionamento interpessoal e liderança académica.</p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className={styles.methodologyCard}>
                            <FaShieldAlt className={styles.methIcon} />
                            <h4>Segurança de Dados</h4>
                            <p>Criptografia de ponta a ponta e logs de auditoria imutáveis garantem a integridade máxima de cada registro no sistema.</p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <motion.section 
                className={styles.visionSection}
                {...fadeInUp}
            >
                <div className={styles.visionContainer}>
                    <div className={styles.visionContent}>
                        <h3>Nossa <span className={styles.highlight}>Visão de Futuro</span></h3>
                        <p>No Instituo Politécnico Maiombe, acreditamos que a tecnologia é a ponte para a excelência. O IPM360 não é apenas um software, é um compromisso com a transparência, o mérito e o crescimento contínuo de cada membro da nossa comunidade laborativa.</p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default SobreSistema;
