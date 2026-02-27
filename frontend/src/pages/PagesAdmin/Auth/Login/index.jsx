import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import styles from './Login.module.css';
import logoImage from '../../../../assets/images/LogoSistema.jpeg';
import LoadingOverlay from '../../../../components/LoadingOverlay';
import { AuthContext } from '../../../../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username, password);

      if (result.success) {
        // Redirecionar baseando-se na role
        setTimeout(() => {
          if (result.role === 'employee' || result.role === 'colaborador') {
            navigate('/user/home');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        setIsLoading(false);
        setError(result.message || 'Falha na autenticação');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Iniciando Sistema..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.card}>
        <div className={styles.leftSide}>
          <div className={styles.logoArea}>
            <img src={logoImage} alt="IPM 360 Logo" className={styles.logo} />
            <h1>Bem-vindo de volta!</h1>
            <p>Acesse sua conta para gerenciar avaliações e desempenho.</p>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.formContent}>
            <h2>Login</h2>
            <p className={styles.subtitle}>Entre com suas credenciais</p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label>Usuário</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineUser className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="Ex: admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Senha</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className={styles.actions}>
                <div className={styles.remember}>
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Lembrar de mim</label>
                </div>
                <a href="#" className={styles.forgot}>Esqueceu a senha?</a>
              </div>

              <button type="submit" className={styles.loginBtn}>Entrar</button>
            </form>

            <div className={styles.footer}>
              <Link to="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>← Voltar para Início</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
