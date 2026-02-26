import React, { useState, useEffect, useContext } from 'react';
import { FaGlobe, FaBell, FaShieldAlt, FaSave, FaUserCog, FaPalette, FaHistory, FaMoon, FaSun, FaLock, FaMobileAlt, FaEnvelope } from 'react-icons/fa';
import styles from './Settings.module.css';
import { AuthContext } from '../../../context/AuthContext';

export default function Settings() {
  const { deleteCurrentUser, setProcessingAction } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Configurações</h2>
        <p>Personalize sua experiência no Portal do Colaborador.</p>
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
            <section className={styles.section}>
              <h3><FaGlobe /> Preferências do Sistema</h3>

              <div className={styles.row}>
                <label>Idioma <span>Idioma da interface</span></label>
                <div className={styles.inputGroup}>
                  <select className={styles.select} defaultValue="pt-BR">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <label>Fuso Horário <span>Para exibição de datas e logs</span></label>
                <div className={styles.inputGroup}>
                  <select className={styles.select} defaultValue="gmt-1">
                    <option value="gmt-3">Brasília (GMT-3)</option>
                    <option value="gmt-1">Luanda (GMT+1)</option>
                    <option value="utc">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>

              <div className={styles.floatingActions}>
                <button className={`${styles.btnAction} ${styles.btnOutline}`}>Cancelar</button>
                <button className={`${styles.btnAction} ${styles.btnPrimary}`}><FaSave /> Salvar Alterações</button>
              </div>
            </section>
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
                  <label>Alterar Senha <span>Última alteração ha 3 meses</span></label>
                  <button className={styles.btnOutline} style={{ width: 'fit-content' }}>Redefinir Senha</button>
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
                        // Iniciar flow de delete
                        setProcessingAction('delete');
                        // Esperar 5 segundos e então deletar (o deleteCurrentUser já faz logout e limpa state)
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
                    onClick={() => toggleTheme('dark')}
                  >
                    <FaMoon /> Modo Escuro
                  </button>
                  <button
                    className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
                    onClick={() => toggleTheme('light')}
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
