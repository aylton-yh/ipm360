import React, { useState, useEffect, useContext } from 'react';
import { FaUserCog, FaDesktop, FaShieldAlt, FaBell, FaLock, FaCamera, FaSave, FaMoon, FaGlobe, FaMobileAlt, FaEnvelope, FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Configuracoes.module.css';

export default function Configuracoes() {
  const { hasPermission, changePassword } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('preferencias');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Estados para segurança (alteração de senha)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      alert("Configurações de " + activeSection + " salvas localmente!");
    }
  };

  // Menu de navegação (Sem Conta e Perfil)
  const menuItems = [
    {
      id: 'preferencias',
      label: 'Preferências',
      desc: 'Tema, idioma e visualização',
      icon: <FaDesktop />,
      color: 'purple'
    },
    {
      id: 'seguranca',
      label: 'Segurança',
      desc: 'Senha, 2FA e histórico',
      icon: <FaShieldAlt />,
      color: 'red'
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      desc: 'Email, Push e SMS',
      icon: <FaBell />,
      color: 'orange'
    },
    {
      id: 'privacidade',
      label: 'Privacidade',
      desc: 'Visibilidade e dados',
      icon: <FaLock />,
      color: 'green'
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'preferencias':
        return (
          <div className={styles.detailView}>
            <h2>Preferências do Sistema</h2>
            <div className={styles.settingCard}>
              <div className={styles.cardIcon}><FaMoon /></div>
              <div className={styles.cardText}>
                <h4>Modo Escuro</h4>
                <p>Alternar entre tema claro e escuro</p>
              </div>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={handleThemeToggle}
                />
                <span></span>
              </div>
            </div>

            <div className={styles.settingCard}>
              <div className={styles.cardIcon}><FaGlobe /></div>
              <div className={styles.cardText}>
                <h4>Idioma do Sistema</h4>
                <select className={styles.selectInput}>
                  <option>Português (AO)</option>
                  <option>English (US)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div className={styles.detailView}>
            <h2>Segurança da Conta</h2>
            <div className={styles.formGroup}>
              <label>Senha Atual</label>
              <input
                type="password"
                placeholder="••••••••"
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
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordInputChange}
                />
              </div>
            </div>

            <h4 style={{ marginTop: 30, marginBottom: 15, color: 'var(--text-primary)' }}>Autenticação</h4>
            <div className={styles.settingCard}>
              <div className={styles.cardIcon}><FaShieldAlt /></div>
              <div className={styles.cardText}>
                <h4>Verificação em Duas Etapas</h4>
                <p>Proteção adicional via SMS ou App</p>
              </div>
              <button className={styles.btnSecondary}>Configurar</button>
            </div>
          </div>
        );

      case 'notificacoes':
        return (
          <div className={styles.detailView}>
            <h2>Notificações</h2>
            <div className={styles.settingOptions}>
              <label className={styles.checkboxOption}>
                <input type="checkbox" defaultChecked />
                <div>
                  <strong><FaEnvelope /> Email</strong>
                  <p>Receber resumos semanais e alertas de segurança</p>
                </div>
              </label>

              <label className={styles.checkboxOption}>
                <input type="checkbox" defaultChecked />
                <div>
                  <strong><FaBell /> Push (Navegador)</strong>
                  <p>Notificações em tempo real sobre atividades</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'privacidade':
        return (
          <div className={styles.detailView}>
            <h2>Privacidade</h2>
            <div className={styles.formGroup}>
              <label>Quem pode ver meu perfil?</label>
              <select className={styles.selectInput}>
                <option>Todos da Organização</option>
                <option>Apenas meu Departamento</option>
                <option>Ninguém (Privado)</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!hasPermission('sistema', 'Configurações')) {
    return (
      <div className="page-container">
        <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
          <p>Você não tem permissão para acessar as configurações do sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className={styles.headerWrapper}>
        <div>
          <h1 className="page-title">Configurações</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Central de preferências do usuário</p>
        </div>
      </div>

      <div className={styles.splitLayout}>
        {/* Lado Esquerdo: Menu */}
        <div className={styles.sidebarMenu}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className={`${styles.menuIcon} ${styles[`bg-${item.color}`]}`}>
                {item.icon}
              </div>
              <div className={styles.menuInfo}>
                <h3>{item.label}</h3>
              </div>
              {activeSection === item.id && <div className={styles.activeIndicator}></div>}
            </div>
          ))}
        </div>

        {/* Lado Direito: Conteúdo */}
        <div className={styles.contentPanel}>
          {renderContent()}

          <div className={styles.contentFooter}>
            <button
              className={styles.btnSave}
              onClick={onSave}
              disabled={loading}
            >
              <FaSave /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
