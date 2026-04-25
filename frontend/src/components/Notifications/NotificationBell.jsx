import React, { useState, useEffect, useContext } from 'react';
import { FaBell, FaCommentDots, FaReply, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
    const { getApiUrl, currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [replyId, setReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const res = await fetch(getApiUrl('/api/evaluations/notifications'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error("Erro ao buscar notificações:", e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleReply = async (id_nota) => {
        if (!replyText.trim()) return;
        setReplyLoading(true);
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        try {
            const res = await fetch(getApiUrl('/api/evaluations/reply-feedback'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_nota, resposta: replyText })
            });
            if (res.ok) {
                setReplyId(null);
                setReplyText('');
                fetchNotifications();
            }
        } catch (e) {
            console.error("Erro ao responder:", e);
        } finally {
            setReplyLoading(false);
        }
    };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'global_admin';

    return (
        <div className={styles.bellContainer}>
            <button className={styles.bellBtn} onClick={() => setShowPopup(!showPopup)}>
                <FaBell />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className={styles.popup}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    >
                        <div className={styles.popupHeader}>
                            <h3>Notificações</h3>
                            <span className={styles.count}>{notifications.length} recentes</span>
                        </div>

                        <div className={styles.notasList}>
                            {notifications.length === 0 ? (
                                <div className={styles.empty}>Nenhuma notificação por enquanto.</div>
                            ) : (
                                notifications.map((n, i) => (
                                    <div key={i} className={`${styles.notaItem} ${!n.is_read ? styles.unread : ''}`}>
                                        <div className={styles.notaIcon}>
                                            {n.type === 'feedback' ? <FaCommentDots color="#ef4444" /> : <FaCheckCircle color="#10b981" />}
                                        </div>
                                        <div className={styles.notaContent}>
                                            <p>{n.message}</p>
                                            <span className={styles.time}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                                            {isAdmin && n.type === 'feedback' && (
                                                <div className={styles.adminActions}>
                                                    {replyId === n.id ? (
                                                        <div className={styles.replyBox}>
                                                            <textarea
                                                                placeholder="Sua resposta..."
                                                                value={replyText}
                                                                onChange={e => setReplyText(e.target.value)}
                                                            />
                                                            <div className={styles.replyBtns}>
                                                                <button onClick={() => setReplyId(null)}>Cancelar</button>
                                                                <button
                                                                    className={styles.btnSend}
                                                                    onClick={() => handleReply(n.link_id || n.id)} // Assumindo link_id para nota_id se necessário
                                                                    disabled={replyLoading}
                                                                >
                                                                    {replyLoading ? 'Enviando...' : <><FaReply /> Responder</>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button className={styles.btnReplyTrigger} onClick={() => setReplyId(n.id)}>
                                                            <FaReply /> Responder Funcionário
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
