import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './LoginUser.module.css';
import logoImage from '../../../assets/images/logoSistema.jpeg';

import { AuthContext } from '../../../context/AuthContext';

export default function LoginUser() {
  const { loginUser } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      setIsLoading(true);
      const res = loginUser(formData.email, formData.password);

      if (res.success) {
        setTimeout(() => navigate('/user/home'), 2000);
      } else {
        setIsLoading(false);
        alert(res.message);
      }
    } else {
      alert("Preencha email e senha.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.waveContainer}>
          <div className={styles.waveBar}></div>
          <div className={styles.waveBar}></div>
          <div className={styles.waveBar}></div>
          <div className={styles.waveBar}></div>
          <div className={styles.waveBar}></div>
        </div>
        <div className={styles.loadingText}>Autenticando Colaborador...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <img src={logoImage} alt="Logo" className={styles.logoImg} />
          <h1>Portal do Colaborador</h1>
          <p>Gerencie seu perfil e suas avaliações</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Corporativo</label>
            <div className={styles.inputContainer}>
              <FaUser className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="nome@empresa.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputContainer}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={styles.input}
                placeholder="Sua senha de acesso"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button" className={styles.togglePass} onClick={() => setShowPass(!showPass)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <label className={styles.remember}>
              <input type="checkbox" /> Lembrar-me
            </label>
            <a href="#" className={styles.forgot}>Esqueceu a senha?</a>
          </div>

          <button type="submit" className={styles.btnSubmit}>Entrar no Portal</button>
        </form>

        <div className={styles.footer}>
          <Link to="/user" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>← Voltar para Início</Link>
        </div>
      </div>
    </div>
  );
}
