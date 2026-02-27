import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BiAlignMiddle } from 'react-icons/bi'
import { AiOutlineUserAdd, AiTwotoneSetting } from 'react-icons/ai'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { RiLogoutBoxRLine, RiLockPasswordLine } from 'react-icons/ri'
import { TbReportSearch } from 'react-icons/tb'
import { BsInfoCircle, BsBuilding } from 'react-icons/bs'
import { FaUserCircle, FaHistory, FaChevronDown, FaChevronRight, FaList, FaTrophy, FaBell, FaRegCommentDots, FaBars, FaChevronLeft, FaFileInvoiceDollar } from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import styles from './Sidebar.module.css'
import logoImg from '../../assets/images/LogoSistema.jpeg'

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const { currentUser, notifications, markNotificationAsRead, clearNotifications, approveAdmin, rejectAdmin, hasPermission } = React.useContext(AuthContext);
  const { unreadCount: chatUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [funcionariosOpen, setFuncionariosOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read && (!n.userId || n.userId === currentUser?.id)).length;
  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUser?.id);

  const isActive = (path) => location.pathname === path;

  // Verifica se alguma rota filha está ativa para manter o menu aberto (opcional)
  // Mas o user pode querer controle manual. Vou deixar manual e abrir se o path bater.
  React.useEffect(() => {
    if (location.pathname.includes('/cadastrar-funcionario') || location.pathname.includes('/funcionarios')) {
      setFuncionariosOpen(true);
    }
  }, [location.pathname]);

  const toggleFuncionarios = () => setFuncionariosOpen(!funcionariosOpen);

  const handleLogout = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula o tempo de processamento do logout
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.cubeGrid}>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
        </div>

        <div className={styles.loadingText}>Encerrando Sessão...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logoImg} alt="Logo" className={styles.systemLogo} />
          <div className={styles.logoText}>
            <h2>IPM360°</h2>
            {!isCollapsed && <span>Gestão Inteligente</span>}
          </div>
        </div>
        <button className={styles.toggleBtn} onClick={toggleSidebar} title={isCollapsed ? "Expandir" : "Recolher"}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {currentUser && (
        <div className={styles.notificationArea}>
          <button className={`${styles.notifBtn} ${isCollapsed ? styles.notifBtnCollapsed : ''}`} onClick={() => setNotifOpen(!notifOpen)}>
            <FaBell />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                Notificações
                <button onClick={clearNotifications}>Limpar</button>
              </div>
              <div className={styles.notifList}>
                {myNotifications.length === 0 ? (
                  <div className={styles.emptyNotif}>Nenhuma notificação</div>
                ) : (
                  myNotifications.map(n => (
                    <div
                      key={n.id}
                      className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}
                    >
                      <div className={styles.notifContent} onClick={() => markNotificationAsRead(n.id)}>
                        {n.message}
                      </div>
                      {n.type === 'new_registration' && currentUser.role === 'global_admin' && (
                        <div className={styles.notifActions}>
                          <button
                            onClick={(e) => { e.stopPropagation(); approveAdmin(n.adminId); }}
                            className={styles.approveBtn}
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); rejectAdmin(n.adminId); }}
                            className={styles.rejectBtn}
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {currentUser?.status === 'pending' && (
        <div className={styles.pendingBanner}>
          <BsInfoCircle /> Aguardando Aprovação
        </div>
      )}

      <nav className={styles.menu}>
        {currentUser?.status !== 'pending' ? (
          <>
            {hasPermission('dashboard', 'Painel Executivo') && (
              <Link to='/dashboard' className={isActive('/dashboard') ? styles.active : ''} title={isCollapsed ? "Dashboard" : ""}>
                <BiAlignMiddle />
                {!isCollapsed && "Dashboard"}
              </Link>
            )}

            {hasPermission('funcionarios', 'Ver Lista') && (
              <div className={styles.menuGroup}>
                <button
                  className={`${styles.menuButton} ${(isActive('/cadastrar-funcionario') || isActive('/funcionarios')) ? styles.activeGroup : ''}`}
                  onClick={toggleFuncionarios}
                  title={isCollapsed ? "Funcionários" : ""}
                >
                  <div className={styles.menuLabel}>
                    <HiOutlineUserGroup />
                    {!isCollapsed && "Funcionários"}
                  </div>
                  {!isCollapsed && (funcionariosOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />)}
                </button>

                <div className={`${styles.submenu} ${funcionariosOpen ? styles.open : ''}`}>
                  {hasPermission('funcionarios', 'Cadastrar') && (
                    <Link to='/cadastrar-funcionario' className={isActive('/cadastrar-funcionario') ? styles.activeSub : ''}>
                      <AiOutlineUserAdd /> Cadastrar
                    </Link>
                  )}
                  <Link to='/funcionarios' className={isActive('/funcionarios') ? styles.activeSub : ''}>
                    <FaList /> Lista
                  </Link>
                </div>
              </div>
            )}

            {hasPermission('departamentos', 'Visualizar') && (
              <Link to='/departamentos' className={isActive('/departamentos') ? styles.active : ''} title={isCollapsed ? "Departamentos" : ""}>
                <BsBuilding />
                {!isCollapsed && "Departamentos"}
              </Link>
            )}

            {hasPermission('avaliacoes', 'Realizar') && (
              <Link to='/avaliar' className={isActive('/avaliar') ? styles.active : ''} title={isCollapsed ? "Avaliar" : ""}>
                <MdOutlinePublishedWithChanges />
                {!isCollapsed && "Avaliar"}
              </Link>
            )}

            {hasPermission('avaliacoes', 'Ver Histórico') && (
              <Link to='/historicos' className={isActive('/historicos') ? styles.active : ''} title={isCollapsed ? "Históricos" : ""}>
                <FaHistory />
                {!isCollapsed && "Históricos"}
              </Link>
            )}

            <Link to='/promocoes' className={isActive('/promocoes') ? styles.active : ''} title={isCollapsed ? "Promoções" : ""}>
              <FaTrophy />
              {!isCollapsed && "Promoções"}
            </Link>

            {hasPermission('sistema', 'Permissões') && (
              <Link to='/permissoes' className={isActive('/permissoes') ? styles.active : ''} title={isCollapsed ? "Permissões" : ""}>
                <RiLockPasswordLine />
                {!isCollapsed && "Permissões"}
              </Link>
            )}
            {hasPermission('sistema', 'Configurações') && (
              <Link to='/configuracoes' className={isActive('/configuracoes') ? styles.active : ''} title={isCollapsed ? "Configurações" : ""}>
                <AiTwotoneSetting />
                {!isCollapsed && "Configurações"}
              </Link>
            )}

            <Link to='/chat-geral' className={isActive('/chat-geral') ? styles.active : ''} title={isCollapsed ? "Chat Geral" : ""}>
              <div className={styles.chatIconWrapper}>
                <FaRegCommentDots />
                {chatUnreadCount > 0 && <span className={styles.chatBadge}>{chatUnreadCount}</span>}
              </div>
              {!isCollapsed && "Chat Geral"}
            </Link>
          </>
        ) : null}

        {currentUser?.role !== 'employee' && (
          <Link to='/minha-conta' className={isActive('/minha-conta') ? styles.active : ''} title={isCollapsed ? "Minha Conta" : ""}>
            <FaUserCircle />
            {!isCollapsed && "Minha Conta"}
          </Link>
        )}

        {currentUser?.status !== 'pending' && (
          <Link to='/relatorios' className={isActive('/relatorios') ? styles.active : ''} title={isCollapsed ? "Relatórios" : ""}>
            <TbReportSearch />
            {!isCollapsed && "Relatórios"}
          </Link>
        )}


        <Link to='/ajuda' className={isActive('/ajuda') ? styles.active : ''} title={isCollapsed ? "Ajuda" : ""}>
          <BsInfoCircle />
          {!isCollapsed && "Ajuda"}
        </Link>
        <a href="#" className={styles.logout} onClick={handleLogout} title={isCollapsed ? "Sair" : ""}>
          <RiLogoutBoxRLine />
          {!isCollapsed && "Sair"}
        </a>
      </nav>
    </div >
  )
}
