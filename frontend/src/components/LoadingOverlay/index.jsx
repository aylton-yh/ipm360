import React from 'react';
import styles from './LoadingOverlay.module.css';
import logoImage from '../../assets/images/LogoSistema.jpeg';

const LoadingOverlay = ({ message = "Processando...", showLogo = true }) => {
  return (
    <div className={styles.loadingOverlay}>
      {showLogo && (
        <img src={logoImage} alt="IPM360" className={styles.loadingLogo} />
      )}
      
      <div className={styles.cubeGrid}>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
        <div className={styles.cube}></div>
      </div>

      <div className={styles.loadingText}>{message}</div>
    </div>
  );
};

export default LoadingOverlay;
