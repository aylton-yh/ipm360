import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import { FaArrowLeft, FaExclamationCircle, FaWhatsapp } from 'react-icons/fa';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username, password, rememberMe);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('remembered_user', username);
        } else {
          localStorage.removeItem('remembered_user');
        }

        setTimeout(() => {
          const role = (result.role || '').toLowerCase().trim();
          const isAdmin = role === 'global_admin' || role === 'gestor';

          if (isAdmin) {
            navigate('/dashboard');
          } else {
            navigate('/user/home');
          }
        }, 1500);
      } else {
        setIsLoading(false);
        setError(result.message || 'Falha na autenticação');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Ocorreu um erro técnico. Tente novamente.');
      console.error(err);
    }
  };

  const handleContactAdmin = () => {
    const phoneNumber = "944436342";
    const message = encodeURIComponent("Olá, preciso de ajuda para recuperar minha senha no sistema IPM 360.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('remembered_user');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  if (isLoading) {
    return <LoadingOverlay message="Sincronizando Dados..." />;
  }

  return (
    <div className={styles.container}>
      {/* Modal de Recuperação de Senha */}
      <AnimatePresence>
        {showRecoveryModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 9999 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3>Esqueceu sua senha?</h3>
              <p>Por questões de segurança, a recuperação de senha deve ser solicitada diretamente ao administrador do sistema.</p>

              <button
                className={styles.contactBtn}
                onClick={handleContactAdmin}
              >
                <FaWhatsapp size={20} />
                Contactar o Administrador
              </button>

              <button
                className={styles.closeModal}
                onClick={() => setShowRecoveryModal(false)}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.meshGradient}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%', '0% 0%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
      >
        {/* Lado Esquerdo - Logo Imersiva */}
        <div className={styles.leftSide}>
          <motion.div
            className={styles.logoAreaFull}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <img src={logoImage} alt="IPM 360 Logo" className={styles.logoImersive} />
          </motion.div>
        </div>

        {/* Lado Direito - Formulário & Textos */}
        <div className={styles.rightSide}>
          <div className={styles.formContent}>
            <motion.div
              className={styles.textRight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2>Portal de Acesso</h2>
              <p className={styles.slogan}>Sua plataforma inteligente para gestão de pessoas e performance.</p>

              <div className={styles.dividerCenter}></div>

              <p className={styles.subtitleCenter}>Identifique-se para continuar</p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.errorMessage}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaExclamationCircle /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className={styles.inputGroup}>
                <label>Usuário ou Email</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineUser className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="Nome de utilizador"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Palavra-passe</label>
                <div className={styles.inputWrapper}>
                  <AiOutlineLock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className={styles.actions}>
                <label className={styles.remember}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Manter conectado</span>
                </label>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={() => setShowRecoveryModal(true)}
                >
                  Recuperar senha
                </button>
              </div>

              <motion.button
                type="submit"
                className={styles.loginBtn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Entrar no Sistema
              </motion.button>
            </motion.form>

            <motion.div
              className={styles.footer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link to="/" className={styles.backLink}>
                <FaArrowLeft /> Voltar para o início
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
