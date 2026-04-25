import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { EmployeeContext } from '../../context/EmployeeContext';
import styles from './ChatGeral.module.css';
import {
    FaPaperPlane, FaTrash, FaUserCircle, FaCircle, FaPlus, FaCog, FaSearch,
    FaTimes, FaImage, FaVideo, FaFileAlt, FaMapMarkerAlt, FaUserPlus,
    FaCalendarAlt, FaChartBar, FaLink, FaDownload, FaMicrophone, FaSmile,
    FaCheck, FaCheckDouble, FaReply, FaPlay, FaHeart, FaThumbsUp, FaLaugh, FaSurprise,
    FaEllipsisV, FaInfoCircle
} from 'react-icons/fa';

const ChatGeral = () => {
    const {
        messages, sendMessage, setReaction, setTypingStatus, votePoll, clearChat, markAsRead,
        chatTheme, setChatTheme, typingUsers
    } = useChat();
    const { currentUser } = useContext(AuthContext);
    const { employees } = useContext(EmployeeContext);

    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [drawerTab, setDrawerTab] = useState('members'); // 'members' | 'media'

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        markAsRead();
    }, [messages, markAsRead]);

    // Typing Logic
    useEffect(() => {
        setTypingStatus(!!newMessage.trim());
    }, [newMessage, setTypingStatus]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const metadata = replyingTo ? {
                replyTo: {
                    id: replyingTo.id,
                    text: replyingTo.content,
                    senderName: replyingTo.senderName
                }
            } : {};

            sendMessage(newMessage.trim(), 'text', metadata);
            setNewMessage('');
            setReplyingTo(null);
        }
    };

    const filteredMessages = useMemo(() => {
        if (!searchQuery) return messages;
        const q = searchQuery.toLowerCase();
        return messages.filter(m =>
            (m.type === 'text' && m.content.toLowerCase().includes(q)) ||
            (m.senderName.toLowerCase().includes(q))
        );
    }, [messages, searchQuery]);

    const renderMessage = (msg) => {
        const isMe = msg.senderId === currentUser?.id;

        return (
            <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`${styles.messageWrapper} ${isMe ? styles.myMessage : styles.theirMessage}`}
            >
                {!isMe && (
                    <div className={styles.fallbackAvatar}>
                        {msg.senderName.charAt(0)}
                    </div>
                )}

                <div className={styles.bubble} onClick={() => setReplyingTo(msg)}>
                    {!isMe && <span className={styles.senderName}>{msg.senderName}</span>}

                    {msg.metadata?.replyTo && (
                        <div className={styles.replyQuote}>
                            <span className={styles.replySender}>{msg.metadata.replyTo.senderName}</span>
                            <p className={styles.replyText}>{msg.metadata.replyTo.text}</p>
                        </div>
                    )}

                    {msg.type === 'text' && <p>{msg.content}</p>}
                    {/* Other types could be handled here similarly */}

                    <span className={styles.timestamp}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </motion.div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatMain}>
                <AnimatePresence>
                    {isSearching && (
                        <motion.div
                            className={styles.searchBarHeader}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <FaSearch />
                            <input
                                placeholder="Pesquisar mensagens..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className={styles.searchCloseBtn} onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                                <FaTimes />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <h1>Chat Colaborativo</h1>
                        {Object.keys(typingUsers).length > 0 && (
                            <span className={styles.typingLabel}>
                                {Object.keys(typingUsers).length > 1 ? 'Várias pessoas digitando...' : 'Alguém está digitando...'}
                            </span>
                        )}
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionIcon} onClick={() => setIsSearching(!isSearching)}>
                            <FaSearch />
                        </button>
                        <button className={styles.actionIcon} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                            <FaEllipsisV />
                        </button>
                    </div>
                </header>

                <div className={styles.messagesList}>
                    <AnimatePresence initial={false}>
                        {filteredMessages.map(renderMessage)}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputPanel}>
                    <AnimatePresence>
                        {replyingTo && (
                            <motion.div
                                className={styles.replyPreview}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <div className={styles.replyInfo}>
                                    <FaReply /> Respondendo a <strong>{replyingTo.senderName}</strong>
                                </div>
                                <button className={styles.replyCloseBtn} onClick={() => setReplyingTo(null)}>
                                    <FaTimes />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                        <div className={styles.inputWrapper}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    className={`${styles.actionIcon} ${isAttachMenuOpen ? styles.active : ''}`}
                                    style={{ border: 'none', background: 'transparent' }}
                                    onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                                >
                                    <FaPlus />
                                </button>
                                <AnimatePresence>
                                    {isAttachMenuOpen && (
                                        <motion.div
                                            className={styles.attachMenu}
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                        >
                                            <div className={styles.attachItem}><div className={`${styles.attachIcon} ${styles.iconImage}`}><FaImage /></div><span>Fotos</span></div>
                                            <div className={styles.attachItem}><div className={`${styles.attachIcon} ${styles.iconFile}`}><FaFileAlt /></div><span>Documentos</span></div>
                                            <div className={styles.attachItem}><div className={`${styles.attachIcon} ${styles.iconPoll}`}><FaChartBar /></div><span>Sondagem</span></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <input
                                placeholder="Escreva sua mensagem..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button className={styles.actionIcon} style={{ border: 'none', background: 'transparent' }}>
                                <FaSmile />
                            </button>
                        </div>
                        <button className={styles.circleBtn} onClick={handleSendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.aside
                        className={styles.settingsDrawer}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.drawerHeader}>
                            <h2>Detalhes do Chat</h2>
                            <button className={styles.actionIcon} onClick={() => setIsSettingsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className={styles.drawerTabs}>
                            <button
                                className={drawerTab === 'members' ? styles.activeTab : ''}
                                onClick={() => setDrawerTab('members')}
                            >
                                Membros
                            </button>
                            <button
                                className={drawerTab === 'media' ? styles.activeTab : ''}
                                onClick={() => setDrawerTab('media')}
                            >
                                Mídia
                            </button>
                        </div>
                        <div className={styles.drawerContent}>
                            {drawerTab === 'members' ? (
                                <div className={styles.membersList}>
                                    {employees.map(member => (
                                        <div key={member.id} className={styles.memberListItem}>
                                            <div className={styles.fallbackAvatar}>{member.nome.charAt(0)}</div>
                                            <div>
                                                <span className={styles.memberNameText}>{member.nome}</span>
                                                <span className={styles.memberRoleText}>{member.cargo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <FaInfoCircle style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }} />
                                    <p>Nenhuma mídia compartilhada recentemente.</p>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatGeral;
