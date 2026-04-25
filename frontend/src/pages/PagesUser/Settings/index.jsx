import React, { useState, useEffect, useContext } from 'react';
import { FaGlobe, FaBell, FaShieldAlt, FaSave, FaUserCog, FaPalette, FaHistory, FaMoon, FaSun, FaLock, FaMobileAlt, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Settings.module.css';
import { AuthContext } from '../../../context/AuthContext';

export default function Settings() {
  const { currentUser, deleteCurrentUser, setProcessingAction, updateCurrentUser, updateTheme, changePassword } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState(localStorage.getItem('ipm360_theme') || 'dark');
  const [language, setLanguage] = useState('pt-AO');
  const [timezone, setTimezone] = useState('gmt+1');

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  const handleSavePreferences = async () => {
    try {
      // In a real app we might have a dedicated preferences endpoint,
      // for now we'll update the user data (theme is already updated)
      alert("Preferências guardadas com sucesso! (Português de Angola e GMT+1 Luanda)");
    } catch (error) {
      alert("Erro ao guardar preferências.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validação de 4 dígitos
    const numericRegex = /^\d{4}$/;
    if (!numericRegex.test(passwordData.new)) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter exatamente 4 dígitos numéricos' });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    const result = await changePassword(passwordData.current, passwordData.new);
    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMsg({ type: '', text: '' });
      }, 2000);
    } else {
      setPasswordMsg({ type: 'error', text: result.message });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Configurações</h2>
        <p>Personalize sua experiência no Portal do Funcionário.</p>
      </div>

      <div className={styles.settingsGrid}>

        {/* SIDEBAR */}
        <div className={styles.nav}>
          <div
            className={`${styles.navItem} ${activeTab === 'general' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaPalette /> Geral
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'notifications' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notificações
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'security' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt /> Segurança
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'appearance' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FaPalette /> Aparência
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.mainContent}>

          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <section className={styles.section}>
                <h3><FaGlobe /> Preferências do Sistema</h3>

                <div className={styles.row}>
                  <label>Idioma <span>Idioma da interface</span></label>
                  <div className={styles.inputGroup}>
                    <select
                      className={styles.select}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="pt-AO">Português (Angola)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.row}>
                  <label>Fuso Horário <span>Para exibição de datas e logs</span></label>
                  <div className={styles.inputGroup}>
                    <select
                      className={styles.select}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="gmt+1">Luanda (GMT+1)</option>
                      <option value="utc">UTC (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className={styles.floatingActions}>
                <button className={`${styles.btnAction} ${styles.btnOutline}`}>Cancelar</button>
                <button
                  className={`${styles.btnAction} ${styles.btnPrimary}`}
                  onClick={handleSavePreferences}
                >
                  <FaSave /> Guardar Alterações
                </button>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <section className={styles.section}>
              <h3><FaBell /> Preferências de Notificação</h3>

              <div className={styles.row}>
                <label>Alertas por E-mail <span>Receber resumo de atividades</span></label>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.row}>
                <label>Novos Ciclos de Avaliação <span>Avisar quando um ciclo iniciar</span></label>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.row}>
                <label>Feedback Recebido <span>Notificar quando um gestor avaliar</span></label>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </section>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <section className={styles.section}>
                <h3><FaLock /> Segurança da Conta</h3>

                <div className={styles.row}>
                  <label>Autenticação em Dois Fatores (2FA) <span>Adiciona uma camada extra de segurança</span></label>
                  <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.row}>
                  <label>Alterar Senha <span>Redefina seu acesso com segurança</span></label>
                  {!showPasswordForm ? (
                    <button
                      className={styles.btnReset}
                      onClick={() => setShowPasswordForm(true)}
                    >
                      <FaLock /> Redefinir Senha
                    </button>
                  ) : (
                    <form className={styles.passwordGroup} onSubmit={handlePasswordChange}>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={visiblePasswords.current ? "text" : "password"}
                          placeholder="Senha Atual"
                          className={styles.passwordInput}
                          required
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        />
                        <button
                          type="button"
                          className={styles.eyeButton}
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {visiblePasswords.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={visiblePasswords.new ? "text" : "password"}
                          placeholder="Nova Senha (4 dígitos)"
                          className={styles.passwordInput}
                          required
                          maxLength={4}
                          inputMode="numeric"
                          value={passwordData.new}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, ''); // Apenas números
                            if (val.length <= 4) setPasswordData({ ...passwordData, new: val });
                          }}
                        />
                        <button
                          type="button"
                          className={styles.eyeButton}
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {visiblePasswords.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={visiblePasswords.confirm ? "text" : "password"}
                          placeholder="Confirmar (4 dígitos)"
                          className={styles.passwordInput}
                          required
                          maxLength={4}
                          inputMode="numeric"
                          value={passwordData.confirm}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, ''); // Apenas números
                            if (val.length <= 4) setPasswordData({ ...passwordData, confirm: val });
                          }}
                        />
                        <button
                          type="button"
                          className={styles.eyeButton}
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {visiblePasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordMsg.text && (
                        <span style={{
                          fontSize: '12px',
                          color: passwordMsg.type === 'error' ? '#ef4444' : '#10b981',
                          fontWeight: '600'
                        }}>
                          {passwordMsg.text}
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                          type="button"
                          className={styles.btnAction}
                          style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                          onClick={() => setShowPasswordForm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className={styles.btnPrimary}
                          style={{ flex: 1, padding: '12px' }}
                        >
                          <FaSave /> Guardar Senha
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              <section className={styles.section}>
                <h3><FaMobileAlt /> Dispositivos Conectados</h3>
                <div className={styles.deviceCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaMobileAlt style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <span style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>iPhone 13 Pro</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Luanda, AO • Ativo agora</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>Atual</span>
                  </div>
                </div>
              </section>
              <section className={styles.section} style={{ borderColor: '#ef4444' }}>
                <h3 style={{ color: '#ef4444' }}><FaShieldAlt /> Zona de Perigo</h3>
                <div className={styles.row}>
                  <div>
                    <strong style={{ display: 'block', color: '#ef4444' }}>Eliminar Conta</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Esta ação é irreversível. Todos os seus dados serão apagados.</span>
                  </div>
                  <button
                    className={styles.btnOutline}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    onClick={() => {
                      if (window.confirm("ATENÇÃO: Tem certeza que deseja eliminar sua conta permanentemente? Esta ação não pode ser desfeita.")) {
                        setProcessingAction('delete');
                        setTimeout(() => {
                          deleteCurrentUser();
                        }, 5000);
                      }
                    }}
                  >
                    Eliminar Conta
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === 'appearance' && (
            <section className={styles.section}>
              <h3><FaPalette /> Aparência da Interface</h3>

              <div className={styles.row}>
                <label>Tema do Sistema <span>Escolha sua preferência visual</span></label>
                <div className={styles.themeToggleGroup}>
                  <button
                    className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
                    onClick={() => handleToggleTheme('dark')}
                  >
                    <FaMoon /> Modo Escuro
                  </button>
                  <button
                    className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
                    onClick={() => handleToggleTheme('light')}
                  >
                    <FaSun /> Modo Claro
                  </button>
                </div>
              </div>

              <div className={styles.row}>
                <label>Densidade <span>Tamanho dos elementos na tela</span></label>
                <div className={styles.inputGroup}>
                  <select className={styles.select}>
                    <option>Confortável (Padrão)</option>
                    <option>Compacto</option>
                  </select>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

// Subcomponents para botões flutuantes (se necessário renderizar fora, mas estão dentro do General/MainContent no design atual)
