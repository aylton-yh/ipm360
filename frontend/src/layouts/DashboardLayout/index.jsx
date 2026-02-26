import React, { useContext } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar'
import styles from './DashboardLayout.module.css'
import { AuthContext } from '../../context/AuthContext'

export default function DashboardLayout() {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Proteção: Se o admin estiver pendente, ele só pode acessar /minha-conta
  if (currentUser?.status === 'pending' && location.pathname !== '/minha-conta' && location.pathname !== '/ajuda') {
    return <Navigate to="/minha-conta" replace />;
  }
  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`${styles.content} ${isSidebarCollapsed ? styles.contentCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
