import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './PublicLayout.module.css';
import logo from '../../assets/images/LogoSistema.jpeg';

export default function PublicLayout() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when location changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className={styles.layout}>
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.headerTop}>
                    <Link to="/" className={styles.logoContainer}>
                        <img src={logo} alt="IPM360 Logo" className={styles.logoImage} />
                        <div className={styles.logoTagline}>
                            Instituto Politécnico Maiombe-3050
                        </div>
                    </Link>
                    
                    <button 
                        className={styles.menuToggle} 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Abrir menu"
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                <div className={styles.divider}></div>

                <AnimatePresence>
                    {(isMenuOpen || window.innerWidth > 1024) && (
                        <motion.nav 
                            className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
                            initial={window.innerWidth <= 1024 ? { opacity: 0, height: 0 } : {}}
                            animate={window.innerWidth <= 1024 ? { opacity: 1, height: 'auto' } : {}}
                            exit={window.innerWidth <= 1024 ? { opacity: 0, height: 0 } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <Link to="/solucoes" className={`${styles.navLink} ${location.pathname === '/solucoes' ? styles.active : ''}`}>Soluções</Link>
                            <Link to="/destaques" className={`${styles.navLink} ${location.pathname === '/destaques' ? styles.active : ''}`}>Destaques</Link>
                            <Link to="/sobre" className={`${styles.navLink} ${location.pathname === '/sobre' ? styles.active : ''}`}>Sobre o Sistema</Link>
                            <Link to="/instituicao" className={`${styles.navLink} ${location.pathname === '/instituicao' ? styles.active : ''}`}>A Instituição</Link>
                            <Link to="/login" className={`${styles.btn} ${styles.btnRegister}`}>Aceder ao Sistema</Link>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
}
