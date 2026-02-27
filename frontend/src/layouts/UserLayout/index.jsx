import React, { useContext, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { BiAlignMiddle, BiLineChart } from 'react-icons/bi'
import { FaUserCircle, FaIdBadge, FaHistory } from 'react-icons/fa' // Importei FaIdBadge para logo
import { AiTwotoneSetting } from 'react-icons/ai'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { MdAssignment } from 'react-icons/md'
import { FaRegCommentDots } from 'react-icons/fa' // Import icon for chat badge
import styles from './UserLayout.module.css'

import { AuthContext } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import LoadingOverlay from '../../components/LoadingOverlay'

export default function UserLayout() {
  const { currentUser, logout, processingAction, setProcessingAction } = useContext(AuthContext);
  const { unreadCount: chatUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path || location.pathname === path + '/';

  const handleLogout = (e) => {
    e.preventDefault();
    setProcessingAction('logout');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 2800); // 2.8s de animação premium
  };
 
  // 1. Prioridade: Se estiver saindo, mostra APENAS o overlay (evita flickers e crashes de permissão)
  if (processingAction === 'logout') {
    return <LoadingOverlay message="Encerrando Sessão..." />;
  }
 
  // 2. Se não houver usuário, redireciona
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver processando Delete Account (controlado externamente ou aqui se movermos a lógica)
  // Mas o deleteAccount será chamado pelo Settings.


  useEffect(() => {
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

  useEffect(() => {
    // Verificação rigorosa: Se for admin ou tiver cargo administrativo, redireciona para o Dashboard Admin
    const isAdmin = currentUser && (
      (currentUser.role === 'admin' || currentUser.role === 'global_admin')
    );

    if (isAdmin) {
      navigate('/dashboard', { replace: true });
    }

    // Se não houver ninguém logado, volta para a landing page do colaborador
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Bloqueio de renderização para admins nas telas de colaborador
  const isAllowed = currentUser && (currentUser.role === 'employee' || currentUser.role === 'colaborador' || !currentUser.role?.includes('admin'));

  if (!currentUser || !isAllowed || currentUser.cargo?.includes('Administrador')) {
    return <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b' }}>Redirecionando...</div>
    </div>;
  }

  return (
    <div className={styles.layout}>
      {/* GLOBAL PROCESSING OVERLAY */}
      {processingAction === 'delete' && <LoadingOverlay message="Eliminando Conta..." />}

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
