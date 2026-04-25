import React, { useContext, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BiAlignMiddle, BiLineChart } from 'react-icons/bi'
import { FaUserCircle, FaHistory } from 'react-icons/fa'
import { AiTwotoneSetting } from 'react-icons/ai'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { MdAssignment } from 'react-icons/md'
import { FaRegCommentDots } from 'react-icons/fa'
import styles from './UserLayout.module.css'
import logo from '../../assets/images/LogoSistema.jpeg'

import { AuthContext } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import LoadingOverlay from '../../components/LoadingOverlay'
import NotificationBell from '../../components/Notifications/NotificationBell'
import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal'

export default function UserLayout() {
  const { currentUser, logout, processingAction, setProcessingAction } = useContext(AuthContext);
  const { unreadCount: chatUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isActive = (path) => location.pathname === path || location.pathname === path + '/';

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
      (currentUser.role === 'global_admin' || currentUser.role === 'gestor')
    );

    if (isAdmin) {
      navigate('/dashboard', { replace: true });
    }

    // Se não houver ninguém logado, volta para a landing page do funcionário
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
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

  // Bloqueio de renderização para admins nas telas de funcionário
  // Priorizamos o ROLE: Se for funcionario/employee, permite.
  const role = (currentUser?.role || '').toLowerCase().trim();
  const isAllowed = currentUser && (role === 'employee' || role === 'funcionario' || role === 'colaborador' || !role.includes('admin'));

  if (!currentUser || !isAllowed) {
    return <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b' }}>Redirecionando para área permitida...</div>
    </div>;
  }

  return (
    <div className={styles.layout}>
      {/* GLOBAL PROCESSING OVERLAY */}
      {processingAction === 'delete' && <LoadingOverlay message="Eliminando Conta..." />}

      {/* Navbar Superior - Hide when processing to avoid interactions? Or just overlay covers it. Overlay z-index 9999 covers it. */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <img src={logo} alt="Logo" className={styles.logoImg} />
          <div className={styles.logoText}>
            <h2>IPM360°</h2>
            <div className={styles.sloganText}>
              {"Monitorando Desempenhos e impulsionando Melhorias".split("").map((char, index) => (
                <motion.span
                  key={index}
                  className={styles.char}
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
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
          <div className={styles.notificationWrapper}>
            <NotificationBell />
          </div>
          <a href="#" onClick={handleLogout} className={styles.logoutBtn}>
            <RiLogoutBoxRLine />Sair
          </a>
        </nav>
      </header>

      {/* Conteúdo Centralizado */}
      <main className={styles.content}>
        <Outlet />
      </main>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Sair da Conta"
        message="Tem certeza de que deseja encerrar a sua sessão?"
        onConfirm={confirmLogout}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  )
}
