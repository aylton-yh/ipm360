import React, { useState, useEffect } from 'react';
import { FaUserCog, FaDesktop, FaShieldAlt, FaBell, FaLock, FaCamera, FaSave, FaMoon, FaGlobe, FaMobileAlt, FaEnvelope, FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Configuracoes.module.css';

export default function Configuracoes() {
  const [activeSection, setActiveSection] = useState('preferencias');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
    switch(activeSection) {
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
               <input type="password" placeholder="••••••••" />
            </div>
            <div className={styles.formRow}>
               <div className={styles.formGroup}>
                 <label>Nova Senha</label>
                 <input type="password" />
               </div>
               <div className={styles.formGroup}>
                 <label>Confirmar Senha</label>
                 <input type="password" />
               </div>
            </div>

            <h4 style={{marginTop: 30, marginBottom: 15, color: 'var(--text-primary)'}}>Autenticação</h4>
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

  return (
    <div className="page-container">
      <div className={styles.headerWrapper}>
        <div>
          <h1 className="page-title">Configurações</h1>
          <p style={{color: 'var(--text-secondary)'}}>Central de preferências do usuário</p>
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
               <button className={styles.btnSave}>
                 <FaSave /> Salvar Alterações
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
