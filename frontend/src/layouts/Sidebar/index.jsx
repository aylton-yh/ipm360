import React, { useState, useEffect, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BiAlignMiddle } from 'react-icons/bi'
import { AiOutlineUserAdd, AiTwotoneSetting } from 'react-icons/ai'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { MdOutlinePublishedWithChanges, MdOutlineCoPresent } from 'react-icons/md'
import { RiLogoutBoxRLine, RiLockPasswordLine } from 'react-icons/ri'
import { TbReportSearch } from 'react-icons/tb'
import { BsInfoCircle, BsBuilding } from 'react-icons/bs'
import {
  FaUserCircle, FaHistory, FaChevronDown, FaChevronRight,
  FaList, FaTrophy, FaBell, FaRegCommentDots, FaChevronLeft, FaTimes, FaArrowUp,
  FaChartBar, FaUserFriends, FaUserPlus, FaCalendarCheck, FaLayerGroup, FaBullseye,
  FaFileAlt, FaLock, FaCog, FaCommentAlt, FaUser, FaLightbulb, FaSignOutAlt
} from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import ConfirmModal from '../../components/ConfirmModal'
import styles from './Sidebar.module.css'
import logoImg from '../../assets/images/LogoSistema.jpeg'

export default function Sidebar({ isCollapsed, toggleSidebar, mobileOpen, setMobileOpen }) {
  const { currentUser, logout, notifications, markNotificationAsRead, clearNotifications, approveAdmin, rejectAdmin, hasPermission, setProcessingAction } = useContext(AuthContext);
  const { unreadCount: chatUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [funcionariosOpen, setFuncionariosOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Admin Chat Popup states
  const [adminChatOpen, setAdminChatOpen] = useState(null); // stores id_nota
  const [adminChatThread, setAdminChatThread] = useState([]);
  const [adminChatLoading, setAdminChatLoading] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');

  const { getApiUrl } = useContext(AuthContext);

  const unreadCount = notifications.filter(n => !n.read && (!n.userId || n.userId === currentUser?.id)).length;
  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUser?.id);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (location.pathname.includes('/cadastrar-funcionario') || location.pathname.includes('/funcionarios')) {
      setFuncionariosOpen(true);
    }
    // Fechar menu mobile ao trocar de rota
    if (mobileOpen && setMobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Verifica o scroll do elemento menu ou da janela
      const menuElement = document.getElementById('sidebar-menu');
      if (menuElement && menuElement.scrollTop > 100) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    const menuElement = document.getElementById('sidebar-menu');
    if (menuElement) {
      menuElement.addEventListener('scroll', handleScroll);
      return () => menuElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const toggleFuncionarios = () => setFuncionariosOpen(!funcionariosOpen);

  const scrollToTop = () => {
    const menuElement = document.getElementById('sidebar-menu');
    if (menuElement) {
      menuElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    }, 2000);
  };

  const fetchAdminThread = async (id_nota) => {
    setAdminChatLoading(true);
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    try {
      const res = await fetch(getApiUrl(`/api/evaluations/feedback/thread/${id_nota}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminChatThread(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminChatLoading(false);
    }
  };

  const handleAdminReply = async () => {
    if (!adminReplyText.trim() || !adminChatOpen) return;
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    try {
      const res = await fetch(getApiUrl('/api/evaluations/feedback/message'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_nota: adminChatOpen, mensagem: adminReplyText })
      });
      if (res.ok) {
        setAdminReplyText('');
        fetchAdminThread(adminChatOpen); // refresh
      }
    } catch (e) {
      console.error("Erro ao responder admin chat:", e);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img src={logoImg} alt="Logo" className={styles.systemLogo} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  className={styles.logoText}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2>IPM360°</h2>
                  <span>Gestão Inteligente</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className={styles.toggleBtn}
            onClick={toggleSidebar}
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {/* Botão de fechar apenas visível no mobile */}
          {mobileOpen && (
            <button className={styles.closeMobile} onClick={() => setMobileOpen(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav className={styles.menu} id="sidebar-menu">
          {currentUser?.status !== 'pending' && (
            <>
              {hasPermission('dashboard', 'Painel Executivo') && (
                <Link to='/dashboard' className={isActive('/dashboard') ? styles.active : ''}>
                  <FaChartBar className={styles.navIcon} />
                  {!isCollapsed && <span>Dashboard</span>}
                </Link>
              )}

              {hasPermission('funcionarios', 'Ver Lista') && (
                <div className={styles.menuGroup}>
                  <button
                    className={`${styles.menuButton} ${(isActive('/cadastrar-funcionario') || isActive('/funcionarios')) ? styles.activeGroup : ''}`}
                    onClick={toggleFuncionarios}
                  >
                    <div className={styles.menuLabel}>
                      <FaUserFriends className={styles.navIcon} />
                      {!isCollapsed && <span>Funcionários</span>}
                    </div>
                    {!isCollapsed && (
                      <motion.div animate={{ rotate: funcionariosOpen ? 180 : 0 }}>
                        <FaChevronDown size={12} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {funcionariosOpen && !isCollapsed && (
                      <motion.div
                        className={styles.submenu}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {hasPermission('funcionarios', 'Cadastrar') && (
                          <Link to='/cadastrar-funcionario' className={isActive('/cadastrar-funcionario') ? styles.activeSub : ''}>
                            <FaUserPlus className={styles.navIconSmall} /> Cadastrar
                          </Link>
                        )}
                        <Link to='/funcionarios' className={isActive('/funcionarios') ? styles.activeSub : ''}>
                          <FaList className={styles.navIconSmall} /> Lista
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {hasPermission('funcionarios', 'Ver Lista') && (
                <Link to='/presenca' className={isActive('/presenca') ? styles.active : ''}>
                  <FaCalendarCheck className={styles.navIcon} />
                  {!isCollapsed && <span>Presença</span>}
                </Link>
              )}

              {hasPermission('departamentos', 'Visualizar') && (
                <Link to='/departamentos' className={isActive('/departamentos') ? styles.active : ''}>
                  <FaLayerGroup className={styles.navIcon} />
                  {!isCollapsed && <span>Departamentos</span>}
                </Link>
              )}

              {hasPermission('avaliacoes', 'Realizar') && (
                <Link to='/avaliar' className={isActive('/avaliar') ? styles.active : ''}>
                  <FaBullseye className={styles.navIcon} />
                  {!isCollapsed && <span>Avaliar</span>}
                </Link>
              )}

              {hasPermission('avaliacoes', 'Ver Histórico') && (
                <Link to='/historicos' className={isActive('/historicos') ? styles.active : ''}>
                  <FaHistory className={styles.navIcon} />
                  {!isCollapsed && <span>Históricos</span>}
                </Link>
              )}

              {hasPermission('relatorios', 'Ver') && (
                <Link to='/relatorios' className={isActive('/relatorios') ? styles.active : ''}>
                  <FaFileAlt className={styles.navIcon} />
                  {!isCollapsed && <span>Relatórios</span>}
                </Link>
              )}

              {hasPermission('promocoes', 'Ver') && (
                <Link to='/promocoes' className={isActive('/promocoes') ? styles.active : ''}>
                  <FaTrophy className={styles.navIcon} />
                  {!isCollapsed && <span>Promoções</span>}
                </Link>
              )}

              {hasPermission('sistema', 'Permissões') && (
                <Link to='/permissoes' className={isActive('/permissoes') ? styles.active : ''}>
                  <FaLock className={styles.navIcon} />
                  {!isCollapsed && <span>Permissões</span>}
                </Link>
              )}

              {hasPermission('sistema', 'Configurações') && (
                <Link to='/configuracoes' className={isActive('/configuracoes') ? styles.active : ''}>
                  <FaCog className={styles.navIcon} />
                  {!isCollapsed && <span>Configurações</span>}
                </Link>
              )}

              <Link to='/chat-geral' className={isActive('/chat-geral') ? styles.active : ''}>
                <div className={styles.chatIconWrapper}>
                  <FaCommentAlt className={styles.navIcon} />
                  {chatUnreadCount > 0 && <span className={styles.chatBadge}>{chatUnreadCount}</span>}
                </div>
                {!isCollapsed && <span>Chat</span>}
              </Link>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <Link to='/minha-conta' className={isActive('/minha-conta') ? styles.active : ''}>
              <FaUser className={styles.navIcon} />
              {!isCollapsed && <span>Perfil</span>}
            </Link>

            <Link to='/ajuda' className={isActive('/ajuda') ? styles.active : ''}>
              <FaLightbulb className={styles.navIcon} />
              {!isCollapsed && <span>Ajuda</span>}
            </Link>

            <a href="#" className={styles.logout} onClick={handleLogout}>
              <FaSignOutAlt className={styles.navIcon} />
              {!isCollapsed && <span>Sair</span>}
            </a>
          </div>
        </nav>

        <div className={styles.notificationArea}>
          <button className={styles.notifBtn} onClick={() => setNotifOpen(!notifOpen)}>
            <FaBell />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            {!isCollapsed && <span style={{ marginLeft: '12px', fontSize: '13px', fontWeight: 600 }}>Notificações</span>}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className={styles.notifDropdown}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
              >
                <div className={styles.notifHeader}>
                  <h3>Notificações</h3>
                  {myNotifications.length > 0 && (
                    <button onClick={clearNotifications} className={styles.clearAllBtn}>Limpar</button>
                  )}
                </div>
                <div className={styles.notifList}>
                  {myNotifications.length === 0 ? (
                    <div className={styles.emptyNotif}>Nenhuma notificação</div>
                  ) : (
                    myNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.type === 'feedback') {
                            setAdminChatOpen(n.link_id);
                            fetchAdminThread(n.link_id);
                            setNotifOpen(false);
                          } else if (n.type === 'reply' || n.type === 'evaluation') {
                            const link = n.link_id ? `/minhas-avaliacoes?id_nota=${n.link_id}` : '/minhas-avaliacoes';
                            navigate(link);
                            setNotifOpen(false);
                          } else if (n.link) {
                            navigate(n.link);
                            setNotifOpen(false);
                          }
                          if (setMobileOpen) setMobileOpen(false);
                        }}
                      >
                        <div className={styles.notifContent}>
                          <p>{n.message}</p>
                          <span>{new Date(n.date).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {!n.read && <div className={styles.unreadDot} />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              className={styles.scrollBtn}
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Voltar ao Topo"
            >
              <FaArrowUp />
            </motion.button>
          )}
        </AnimatePresence>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirmar Saída"
        message="Tem certeza que deseja encerrar a sessão?"
        confirmText="Sair do Sistema"
        cancelText="Cancelar"
        type="danger"
      />

      <AnimatePresence>
        {adminChatOpen && (
          <div className={styles.chatModalOverlay} onClick={() => setAdminChatOpen(null)}>
            <motion.div 
               className={styles.chatModal}
               onClick={e => e.stopPropagation()}
               initial={{opacity: 0, y: 30, scale: 0.95}}
               animate={{opacity: 1, y: 0, scale: 1}}
               exit={{opacity: 0, y: 30, scale: 0.95}}
            >
              <div className={styles.chatModalHeader}>
                <h3>Responder Feedback</h3>
                <button onClick={() => setAdminChatOpen(null)}><FaTimes /></button>
              </div>
              <div className={styles.chatModalBody}>
                {adminChatLoading ? <p className={styles.loadingText}>Carregando mensagens...</p> : (
                  <div className={styles.chatMessages}>
                    {adminChatThread.map((msg, idx) => (
                      <div key={idx} className={`${styles.chatMsgItem} ${msg.tipo_remetente === 'admin' ? styles.myMsg : styles.otherMsg}`}>
                         <div className={styles.msgBubble}>
                           <p>{msg.mensagem}</p>
                           <span>{new Date(msg.criado_em).toLocaleString('pt-PT', {hour:'2-digit', minute:'2-digit'})}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.chatModalFooter}>
                <textarea 
                  placeholder="Escreva sua resposta para o funcionário..."
                  value={adminReplyText}
                  onChange={e => setAdminReplyText(e.target.value)}
                />
                <button 
                  onClick={handleAdminReply} 
                  disabled={!adminReplyText.trim() || adminChatLoading}
                  className={styles.btnSendChat}
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
