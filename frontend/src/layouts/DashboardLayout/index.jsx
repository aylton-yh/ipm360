import React, { useContext, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import Sidebar from '../Sidebar'
import styles from './DashboardLayout.module.css'
import { AuthContext } from '../../context/AuthContext'
import LoadingOverlay from '../../components/LoadingOverlay'
import NotificationBell from '../../components/Notifications/NotificationBell'
import logoImg from '../../assets/images/LogoSistema.jpeg'

export default function DashboardLayout() {
  const { currentUser, processingAction } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (processingAction === 'logout') {
    return <LoadingOverlay message="Encerrando sessão com segurança..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isSytemAdmin = currentUser?.role === 'global_admin' || currentUser?.role === 'gestor';
  if (currentUser && !isSytemAdmin) {
    return <Navigate to="/user/home" replace />;
  }

  if (currentUser?.status === 'pending' && location.pathname !== '/minha-conta' && location.pathname !== '/ajuda') {
    return <Navigate to="/minha-conta" replace />;
  }

  // Restrição de Segurança: Apenas o Administrador Global pode aceder às Permissões
  if (location.pathname === '/permissoes' && currentUser?.role !== 'global_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile Top Bar - High End Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuBtn} onClick={() => setMobileOpen(true)}>
          <FaBars />
        </button>
        <div className={styles.logoWrapper}>
          <img src={logoImg} alt="IPM360" className={styles.logoMobile} />
          <span>IPM360°</span>
        </div>
        <div className={styles.headerActions}>
          <NotificationBell />
        </div>
      </header>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className={`${styles.content} ${isSidebarCollapsed ? styles.contentCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
