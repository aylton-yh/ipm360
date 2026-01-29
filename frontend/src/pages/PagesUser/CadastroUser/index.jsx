import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './CadastroUser.module.css';
import logoImage from '../../../assets/images/logoSistema.jpeg';

export default function CadastroUser() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/user/home');
    }, 4000); // 4 Segundos
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
         <div className={styles.waveContainer}>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
         </div>
         <div className={styles.loadingText}>Criando seu perfil profissional...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <img src={logoImage} alt="IPM 360" className={styles.logoSide} />
          <h2>Bem-vindo ao IPM 360°</h2>
          <p>O melhor lugar para acompanhar seu desenvolvimento profissional e alcançar novos patamares.</p>
          
          <ul className={styles.featureList}>
             <li><FaCheckCircle /> Acompanhe suas avaliações</li>
             <li><FaCheckCircle /> Receba feedbacks em tempo real</li>
             <li><FaCheckCircle /> Histórico completo de carreira</li>
          </ul>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formHeader}>
             <h2>Ativar minha conta</h2>
             <p>Preencha os dados abaixo para iniciar.</p>
          </div>

          <form onSubmit={handleRegister}>
             <div className={styles.row}>
                <div className={styles.formGroup}>
                   <label className={styles.label}>Nome</label>
                   <input type="text" className={styles.input} placeholder="Seu nome" />
                </div>
                <div className={styles.formGroup}>
                   <label className={styles.label}>Sobrenome</label>
                   <input type="text" className={styles.input} placeholder="Seu sobrenome" />
                </div>
             </div>

             <div className={styles.formGroup}>
                <label className={styles.label}>Email Corporativo</label>
                <input type="email" className={styles.input} placeholder="seu.email@empresa.com" />
             </div>

             <div className={styles.row}>
                <div className={styles.formGroup}>
                   <label className={styles.label}>Senha</label>
                   <input type="password" className={styles.input} placeholder="Mínimo 8 caracteres" />
                </div>
                <div className={styles.formGroup}>
                   <label className={styles.label}>Confirmar Senha</label>
                   <input type="password" className={styles.input} placeholder="Repita a senha" />
                </div>
             </div>

             <button type="submit" className={styles.btnRegister}>Criar Conta</button>
          </form>

          <div className={styles.footer}>
             Já tem uma conta ativa? <Link to="/user/login" className={styles.link}>Fazer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
