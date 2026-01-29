import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AiOutlineUser, 
  AiOutlineMail, 
  AiOutlineLock, 
  AiOutlineEye, 
  AiOutlineEyeInvisible 
} from 'react-icons/ai';
import styles from './Cadastrar.module.css';
import logoImage from '../../../assets/images/logoSistema.jpeg';

export default function Cadastrar() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const togglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulação de Validação e Envio
    if (formData.username && formData.email && formData.password) {
      setIsLoading(true);
      
      // Delay simulado de cadastro + redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } else {
       alert("Preencha todos os campos");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
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
         <div className={styles.loadingText}>Criando sua conta...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.card}>
        <div className={styles.leftSide}>
          <div className={styles.logoArea}>
            <img src={logoImage} alt="IPM 360 Logo" className={styles.logo} />
            <h1>Crie sua Conta</h1>
            <p>Junte-se a nós e comece a gerenciar seu desempenho profissional hoje mesmo.</p>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.formContent}>
            <h2>Cadastro</h2>
            <p className={styles.subtitle}>Preencha seus dados para começar</p>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Nome de Utilizador</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineUser className={styles.inputIcon} />
                  <input 
                    type="text" 
                    name="username"
                    placeholder="Escolha um nome de usuário"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>E-mail</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineMail className={styles.inputIcon} />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Senha</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Crie uma senha forte"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.loginBtn}>Cadastrar</button>
            </form>

            <div className={styles.footer}>
              Já tem uma conta? <Link to="/login">Fazer Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
