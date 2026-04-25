import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCompass } from 'react-icons/fa';
import imgIPM1 from '../../../../assets/images/imgIPM1.png';
import imgIPM2 from '../../../../assets/images/imgIPM2.png';
import imgIPM3 from '../../../../assets/images/imgIPM3_fixed.png';
import imgIPM4 from '../../../../assets/images/imgIPM4.png';
import styles from './Instituicao.module.css';

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

const Instituicao = () => {
    return (
        <div className={styles.pageContainer}>
            <motion.section 
                className={styles.pageHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>A Nossa <span className={styles.highlight}>Instituição</span></h1>
                <p>O pilar fundamental de infraestrutura, laboratório e de vivência académica que suporta a excelência do Instituto Politécnico Maiombe-3050.</p>
            </motion.section>

            <motion.section
                className={styles.campusSection}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >

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

            <motion.section 
                className={styles.locationSection}
                {...fadeInUp}
            >
                <div className={styles.locationContainer}>
                    <div className={styles.locationInfo}>
                        <div className={styles.locationBadge}>
                            <FaMapMarkerAlt /> Localização
                        </div>
                        <h3>Onde nos <span className={styles.highlight}>Encontrar</span></h3>
                        <p className={styles.address}>
                            Província do Icolo e Bengo, Município do Sequele, <br />
                            Comuna da Funda, Bairro Maiombe, <br />
                            <strong>Junto à Esquadra Policial.</strong>
                        </p>
                        <div className={styles.locationFeatures}>
                            <div className={styles.locFeature}>
                                <FaCompass /> Centro Tecnológico da Funda
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.mapWrapper}>
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.57654321!2d13.5684!3d-8.9123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNTQnNDQuNCJTIDEzwrAzNCcwNi4yIkU!5e0!3m2!1spt-BR!2sao!4v1713210000000!5m2!1spt-BR!2sao" 
                            width="100%" 
                            height="350" 
                            style={{ border: 0, borderRadius: '1rem' }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa de Localização IPM3050"
                        ></iframe>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Instituicao;
