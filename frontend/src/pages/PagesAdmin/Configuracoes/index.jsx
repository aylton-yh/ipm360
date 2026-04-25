import React, { useState, useContext } from 'react';
import {
  FaUserCog, FaDesktop, FaShieldAlt, FaBell, FaLock,
  FaSave, FaMoon, FaSun, FaGlobe, FaArrowLeft
} from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Configuracoes.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function Configuracoes() {
  const { hasPermission, changePassword, theme, updateTheme } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('preferencias');

  // Estados para segurança (alteração de senha)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    if (activeSection === 'seguranca') {
      if (passwords.new !== passwords.confirm) {
        return alert("As novas senhas não coincidem!");
      }
      if (passwords.new.length < 4) {
        return alert("A nova senha deve ter pelo menos 4 caracteres.");
      }

      setLoading(true);
      const res = await changePassword(passwords.current, passwords.new);
      setLoading(false);

      if (res.success) {
        alert("Senha alterada com sucesso!");
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        alert(res.message);
      }
    } else {
      alert("Configurações salvas e sincronizadas!");
    }
  };

  const menuItems = [
    { id: 'preferencias', label: 'Preferências', icon: <FaDesktop />, color: 'emerald' },
    { id: 'seguranca', label: 'Segurança', icon: <FaShieldAlt />, color: 'rose' },
    { id: 'notificacoes', label: 'Notificações', icon: <FaBell />, color: 'amber' },
    { id: 'privacidade', label: 'Privacidade', icon: <FaLock />, color: 'indigo' },
  ];

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.detailView}
        >
          {activeSection === 'preferencias' && (
            <>
              <h2>Personalização</h2>
              <div className={styles.settingCard}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}>
                    {theme === 'dark' ? <FaMoon /> : <FaSun />}
                  </div>
                  <div className={styles.cardText}>
                    <h4>Tema do Sistema</h4>
                    <p>Escolha o aspeto visual que mais lhe agrada</p>
                  </div>
                </div>
                <div className={styles.themeSwitch}>
                  <button
                    className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                    onClick={() => updateTheme('light')}
                  >
                    <FaSun /> Claro
                  </button>
                  <button
                    className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                    onClick={() => updateTheme('dark')}
                  >
                    <FaMoon /> Escuro
                  </button>
                </div>
              </div>

              <div className={styles.settingCard}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><FaGlobe /></div>
                  <div className={styles.cardText}>
                    <h4>Idioma Principal</h4>
                    <p>Defina o idioma das labels e menus</p>
                  </div>
                </div>
                <select className={styles.selectInput} style={{ width: 'auto', minWidth: '180px' }}>
                  <option>Português (AO)</option>
                  <option>Português (BR)</option>
                  <option>English (US)</option>
                </select>
              </div>
            </>
          )}

          {activeSection === 'seguranca' && (
            <>
              <h2>Segurança do Acesso</h2>
              <div className={styles.formGroup}>
                <label>Senha Atual</label>
                <input
                  type="password"
                  placeholder="Sua senha atual"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordInputChange}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Mínimo 4 caracteres"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordInputChange}
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'notificacoes' && (
            <>
              <h2>Preferências de Alerta</h2>
              <div className={styles.settingCard}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><FaBell /></div>
                  <div className={styles.cardText}>
                    <h4>Notificações Push</h4>
                    <p>Alertas em tempo real no navegador</p>
                  </div>
                </div>
                <div className={styles.themeSwitch}>
                  <button className={`${styles.themeBtn} ${styles.active}`}>Ativado</button>
                  <button className={styles.themeBtn}>Desativado</button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'privacidade' && (
            <>
              <h2>Gestão de Dados</h2>
              <div className={styles.settingCard}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><FaLock /></div>
                  <div className={styles.cardText}>
                    <h4>Visibilidade do Perfil</h4>
                    <p>Quem pode ver seus dados de desempenho</p>
                  </div>
                </div>
                <select className={styles.selectInput} style={{ width: 'auto' }}>
                  <option>Toda a Organização</option>
                  <option>Apenas Liderança</option>
                  <option>Privado</option>
                </select>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!hasPermission('sistema', 'Configurações')) {
    return (
      <div className="page-container">
        <div className="card-modern" style={{ textAlign: 'center', padding: '100px 40px' }}>
          <FaShieldAlt size={80} color="var(--primary-color)" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h2 style={{ color: 'var(--text-primary)', fontSize: '32px', fontWeight: 800 }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
            Apenas administradores de alto nível podem gerir estas definições.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            Gira suas preferências, segurança e aspeto do sistema.
          </p>
        </div>
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.sidebarMenu}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className={styles.menuIcon}>{item.icon}</div>
              <div className={styles.menuInfo}>
                <h3>{item.label}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.contentPanel}>
          {renderContent()}

          <div className={styles.contentFooter}>
            <button
              className="btn-primary"
              onClick={onSave}
              disabled={loading}
              style={{ padding: '12px 40px' }}
            >
              <FaSave /> {loading ? 'A processar...' : 'Guardar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
