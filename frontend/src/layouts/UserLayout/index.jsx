import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BiAlignMiddle, BiLineChart } from 'react-icons/bi'
import { FaUserCircle, FaIdBadge, FaHistory } from 'react-icons/fa' // Importei FaIdBadge para logo
import { AiTwotoneSetting } from 'react-icons/ai'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { MdAssignment } from 'react-icons/md'
import { FaRegCommentDots } from 'react-icons/fa' // Import icon for chat badge
import styles from './UserLayout.module.css'

import { AuthContext } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { Navigate } from 'react-router-dom'

export default function UserLayout() {
  const { currentUser, logout, processingAction, setProcessingAction } = React.useContext(AuthContext);
  const { unreadCount: chatUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path || location.pathname === path + '/';

  const handleLogout = (e) => {
    e.preventDefault();
    setProcessingAction('logout');
    // Simula logout process
    setTimeout(() => {
      logout();
      setProcessingAction(null);
      navigate('/user/login');
    }, 3000);
  };

  // Se estiver processando Delete Account (controlado externamente ou aqui se movermos a lógica)
  // Mas o deleteAccount será chamado pelo Settings.

  // Styles inline para o overlay (inspirado no LoginUser)
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc', // Cor de fundo suave do Login
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", sans-serif'
  };

  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(37, 99, 235, 0.1)',
    borderLeftColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  React.useEffect(() => {
    // Inject keyframes for spin if not present
    if (!document.getElementById('spin-style')) {
      const style = document.createElement('style');
      style.id = 'spin-style';
      style.innerHTML = `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        `;
      document.head.appendChild(style);
    }
  }, []);

  React.useEffect(() => {
    // Verificação rigorosa: Se for admin ou tiver cargo administrativo, redireciona para o Dashboard Admin
    const isAdmin = currentUser && (
      (currentUser.role === 'admin' || currentUser.role === 'global_admin')
    );

    if (isAdmin) {
      navigate('/dashboard', { replace: true });
    }

    // Se não houver ninguém logado, volta para a landing page do colaborador
    if (!currentUser) {
      navigate('/user', { replace: true });
    }
  }, [currentUser, navigate]);

  // Bloqueio de renderização para admins nas telas de colaborador
  const isAllowed = currentUser && (currentUser.role === 'employee' || !currentUser.role?.includes('admin'));

  if (!currentUser || !isAllowed || currentUser.cargo?.includes('Administrador')) {
    return <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b' }}>Redirecionando...</div>
    </div>;
  }

  return (
    <div className={styles.layout}>
      {/* GLOBAL PROCESSING OVERLAY */}
      {processingAction && (
        <div style={overlayStyle}>
          {/* LOGOUT SCREEN */}
          {processingAction === 'logout' && (
            <>
              <div className={styles.brand} style={{ marginBottom: '30px', transform: 'scale(1.2)' }}>
                <div style={{ fontSize: '32px', color: '#2563eb', display: 'flex', justifyContent: 'center' }}><FaIdBadge /></div>
              </div>
              <div style={spinnerStyle}></div>
              <h2 style={{ marginTop: '20px', color: '#1e293b', fontSize: '1.5rem' }}>Encerrando Sessão...</h2>
              <p style={{ color: '#64748b', marginTop: '5px' }}>Até logo, {currentUser?.nome?.split(' ')[0]}!</p>
            </>
          )}

          {/* DELETE ACCOUNT SCREEN */}
          {processingAction === 'delete' && (
            <>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px',
                animation: 'pulse-red 2s infinite'
              }}>
                <FaIdBadge />
              </div>
              <div style={{ ...spinnerStyle, borderColor: 'rgba(239, 68, 68, 0.1)', borderLeftColor: '#ef4444' }}></div>
              <h2 style={{ marginTop: '20px', color: '#ef4444', fontSize: '1.5rem' }}>Eliminando Conta...</h2>
              <p style={{ color: '#64748b', marginTop: '5px' }}>Todos os seus dados estão sendo apagados.</p>
            </>
          )}
        </div>
      )}

      {/* Navbar Superior - Hide when processing to avoid interactions? Or just overlay covers it. Overlay z-index 9999 covers it. */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <div style={{ fontSize: '32px', color: '#2563eb' }}><FaIdBadge /></div>
          <div className={styles.logoText}>
            <h2>IPM360°</h2>
            <span>Portal do Colaborador</span>
          </div>
        </div>

        <nav className={styles.menu}>
          <Link to='/user/home' className={`${styles.navLink} ${isActive('/user/home') || isActive('/user') ? styles.active : ''}`}>
            <BiAlignMiddle />Dashboard
          </Link>
          <Link to='/minhas-avaliacoes' className={`${styles.navLink} ${isActive('/minhas-avaliacoes') ? styles.active : ''}`}>
            <MdAssignment />Avaliações
          </Link>
          <Link to='/status' className={`${styles.navLink} ${isActive('/status') ? styles.active : ''}`}>
            <BiLineChart />Desempenho
          </Link>
          <Link to='/profile' className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}>
            <FaUserCircle />Meu Perfil
          </Link>
          <Link to='/historico' className={`${styles.navLink} ${isActive('/historico') ? styles.active : ''}`}>
            <FaHistory />Histórico
          </Link>
          <Link to='/user/chat-geral' className={`${styles.navLink} ${isActive('/user/chat-geral') ? styles.active : ''}`}>
            <div className={styles.chatIconWrapper}>
              <FaRegCommentDots />
              {chatUnreadCount > 0 && <span className={styles.chatBadge}>{chatUnreadCount}</span>}
            </div>
            Chat Geral
          </Link>
          <Link to='/settings' className={`${styles.navLink} ${isActive('/settings') ? styles.active : ''}`}>
            <AiTwotoneSetting />Ajustes
          </Link>
          <a href="#" onClick={handleLogout} className={styles.logoutBtn}>
            <RiLogoutBoxRLine />Sair
          </a>
        </nav>
      </header>

      {/* Conteúdo Centralizado */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
