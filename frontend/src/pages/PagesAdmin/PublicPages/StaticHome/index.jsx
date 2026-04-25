import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StaticHome.module.css';
import heroBg from '../../../../assets/images/imgIPM3_fixed.png';

// Importando imagens para o slide
import imgIPM1 from '../../../../assets/images/imgIPM1.png';
import imgIPM2 from '../../../../assets/images/imgIPM2.png';
import imgIPM3 from '../../../../assets/images/imgIPM3_fixed.png';
import imgIPM4 from '../../../../assets/images/imgIPM4.png';

const slideImages = [imgIPM1, imgIPM2, imgIPM3, imgIPM4];

const StaticHome = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % slideImages.length);
        }, 3500); // Muda de imagem a cada 3.5 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.staticContainer}>
            <section
                className={styles.hero}
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className={styles.heroLayout}>
                    {/* Lado Esquerdo: Textos e Slogan */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className={styles.heroLeft}
                    >
                        <motion.h1 
                            className={styles.heroTitle}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Educar com propósito, <span className={styles.highlight}>Avaliar com Precisão</span>
                        </motion.h1>

                        <p className={styles.heroSubtitle}>
                            A Plataforma definitiva para gerenciar desempenhos, competências e o desenvolvimento da equipa laborativa no Instituto Politécnico Maiombe-3050.
                        </p>
                    </motion.div>

                    {/* Lado Direito: Card com o Slide de Imagens */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        className={styles.heroRight}
                    >
                        <div className={styles.sliderCard}>
                            <div className={styles.sliderHeader}>
                                O Nosso Campus
                            </div>
                            <div className={styles.imageContainer}>
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={slideImages[currentImageIndex]}
                                        alt="IPM360 Instalações"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className={styles.sliderImg}
                                    />
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                <footer className={styles.mainFooter}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerCol}>
                            <h3>IPM360°</h3>
                            <p>Liderando a excelência laborativa e académica por meio de uma plataforma de transparência e mérito na instituição.</p>
                        </div>
                        
                        <div className={styles.footerCol}>
                            <h4>Contacto & Localização</h4>
                            <p>📧 ipm@gmail.com</p>
                            <p>📞 +244 944 436 342</p>
                            <p>📍 Bairro Maiombe, Funda</p>
                        </div>

                        <div className={styles.footerCol}>
                            <h4>Horário de Funcionamento</h4>
                            <p>Segunda — Sexta: 07h às 18h</p>
                            <p>Acesso ao Portal: 24h / 24h</p>
                        </div>

                        <div className={styles.footerCol}>
                            <h4>Suporte Técnico</h4>
                            <p>📧 ipm@gmail.com</p>
                            <p>📱 Whatsapp: 944 436 342</p>
                            <p>🕒 Disponibilidade: 24h / 24h</p>
                        </div>
                    </div>
                    
                    <div className={styles.footerBottom}>
                        <div className={styles.copyright}>
                            &copy; 2026 Instituto Politécnico Maiombe. Todos os direitos reservados.
                        </div>
                        <div className={styles.footerTag}>
                            Excelência em Avaliação 360°
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
};

export default StaticHome;
