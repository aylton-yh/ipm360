import React, { useContext } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar'
import styles from './DashboardLayout.module.css'
import { AuthContext } from '../../context/AuthContext'
import LoadingOverlay from '../../components/LoadingOverlay'

export default function DashboardLayout() {
  const { currentUser, processingAction } = useContext(AuthContext);
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };


  // 1. Prioridade: Se estiver saindo, mostra APENAS o overlay (evita flickers e crashes de permissão)
  if (processingAction === 'logout') {
    return <LoadingOverlay message="Encerrando Sessão..." />;
  }
 
  // 2. Se não houver usuário, redireciona
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
 
  // 3. Proteção Admin: Se o user não for admin, volta para a home dele
  const isSytemAdmin = currentUser?.role === 'admin' || currentUser?.role === 'global_admin';
  if (currentUser && !isSytemAdmin) {
    return <Navigate to="/user/home" replace />;
  }
 
  // 4. Proteção Status: Se o admin estiver pendente, ele só pode acessar /minha-conta
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
