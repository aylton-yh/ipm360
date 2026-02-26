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
    FaCheck, FaCheckDouble, FaReply, FaPlay, FaHeart, FaThumbsUp, FaLaugh, FaSurprise
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
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [drawerTab, setDrawerTab] = useState('info'); // 'info' | 'media' | 'members'
    const [pollModalOpen, setPollModalOpen] = useState(false);
    const [pollData, setPollData] = useState({ question: '', options: ['', ''] });

    // Filtro de mensagens por pesquisa
    const filteredMessages = useMemo(() => {
        if (!searchQuery) return messages;
        const q = searchQuery.toLowerCase();
        return messages.filter(m =>
            (m.type === 'text' && m.content.toLowerCase().includes(q)) ||
            (m.senderName.toLowerCase().includes(q))
        );
    }, [messages, searchQuery]);

    // Filtros de Mídia e Links
    const sharedMedia = useMemo(() => messages.filter(m => ['image', 'video', 'file'].includes(m.type)), [messages]);
    const sharedLinks = useMemo(() => messages.filter(m => m.type === 'text' && (m.content.includes('http') || m.content.includes('www'))), [messages]);

    // Voice Recording State (Mock)
    const [isRecording, setIsRecording] = useState(false);

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
        if (newMessage.trim()) {
            setTypingStatus(true);
        } else {
            setTypingStatus(false);
        }
    }, [newMessage, setTypingStatus]);

    const handleSendText = (e) => {
        e.preventDefault();
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
            setIsEmojiPickerOpen(false);
        }
    };

    const handleReaction = (msgId, emoji) => {
        setReaction(msgId, emoji);
        setActiveMessageMenu(null);
    };

    const handleAttach = (type) => {
        setIsAttachMenuOpen(false);
        const mockContent = {
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            file: 'documento_projeto.pdf',
            location: 'IPM360 HQ - Luanda',
            contact: 'Admin Central',
            event: 'Workhop Design System'
        };
        sendMessage(mockContent[type] || 'Anexo', type);
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderTicks = (status) => {
        switch (status) {
            case 'sent': return <FaCheck className={styles.sentTicks} />;
            case 'delivered': return <FaCheckDouble className={styles.sentTicks} />;
            case 'read': return <FaCheckDouble className={styles.readTicks} />;
            default: return null;
        }
    };

    const renderMessageContent = (msg) => {
        const isMe = msg.senderId === currentUser?.id;

        return (
            <div className={styles.messageContent} onContextMenu={(e) => { e.preventDefault(); setActiveMessageMenu(msg.id); }}>
                {/* Reply Section */}
                {msg.metadata?.replyTo && (
                    <div className={styles.replyQuote} onClick={() => {
                        const target = document.getElementById(`msg-${msg.metadata.replyTo.id}`);
                        target?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        <span className={styles.replySender}>{msg.metadata.replyTo.senderName}</span>
                        <span className={styles.replyText}>{msg.metadata.replyTo.text}</span>
                    </div>
                )}

                {/* Message Types */}
                <div className={styles.bubble}>
                    {!isMe && <span className={styles.senderName}>{msg.senderName}</span>}

                    {msg.type === 'image' && <div className={styles.mediaContent}><img src={msg.content} alt="" /></div>}
                    {msg.type === 'video' && <div className={styles.mediaContent}><video src={msg.content} controls /></div>}
                    {msg.type === 'voice' && (
                        <div className={styles.voiceBox}>
                            <FaPlay className={styles.playBtn} />
                            <div className={styles.waveForm} />
                            <span>0:05</span>
                        </div>
                    )}
                    {msg.type === 'poll' && (
                        <div className={styles.pollBox}>
                            <h4 style={{ margin: '0 0 10px 0' }}>📊 {msg.content}</h4>
                            {msg.metadata.options.map((opt, i) => (
                                <div key={i} className={styles.pollOption} onClick={() => votePoll(msg.id, i)}>
                                    <div className={styles.optionText}>
                                        <span>{opt.text}</span>
                                        <span>{opt.votes?.length || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {msg.type === 'text' && <p>{msg.content}</p>}

                    <div className={styles.bubbleFooter}>
                        <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                        {isMe && renderTicks(msg.status)}
                    </div>
                </div>

                {/* Reactions UI */}
                {msg.metadata?.reactions && Object.keys(msg.metadata.reactions).length > 0 && (
                    <div className={styles.reactionsContainer}>
                        {Object.entries(msg.metadata.reactions).map(([emoji, users]) => (
                            <div key={emoji} className={styles.reactionItem}>
                                <span className={styles.reactionIcon}>{emoji}</span>
                                {users.length > 1 && <span className={styles.reactionCount}>{users.length}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Context Menu */}
                {activeMessageMenu === msg.id && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={styles.messageActions}>
                        <button onClick={() => handleReaction(msg.id, '❤️')}><FaHeart color="#ef4444" /></button>
                        <button onClick={() => handleReaction(msg.id, '👍')}><FaThumbsUp color="#3b82f6" /></button>
                        <button onClick={() => handleReaction(msg.id, '😂')}><FaLaugh color="#facc15" /></button>
                        <button onClick={() => { setReplyingTo(msg); setActiveMessageMenu(null); }}><FaReply /></button>
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className={`${styles.container} ${styles[`theme_${chatTheme}`]}`} onClick={() => setActiveMessageMenu(null)}>
            <div className={styles.chatMain}>
                <header className={styles.chatHeader}>
                    <div className={styles.headerInfo}>
                        <div className={styles.avatarWrapper}><div className={styles.fallbackAvatar}>G</div></div>
                        <div>
                            <h1>Chat Geral IPM360</h1>
                            {Object.keys(typingUsers).length > 0 && (
                                <span className={styles.typingLabel}>
                                    {Object.keys(typingUsers).length > 1 ? 'Várias pessoas digitando...' : 'Digitando...'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.actionIcon}
                            onClick={(e) => { e.stopPropagation(); setIsSearching(!isSearching); }}
                            title="Pesquisar"
                        >
                            <FaSearch />
                        </button>
                        <button
                            className={styles.actionIcon}
                            onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                            title="Definições"
                        >
                            <FaCog />
                        </button>
                    </div>
                </header>

                <div className={styles.messagesList} onClick={() => setIsEmojiPickerOpen(false)}>
                    {isSearching && (
                        <div className={styles.searchBarHeader}>
                            <input
                                placeholder="Pesquisar na conversa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button
                                className={styles.searchCloseBtn}
                                onClick={(e) => { e.stopPropagation(); setIsSearching(false); setSearchQuery(''); }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} id={`msg-${msg.id}`} className={`${styles.messageWrapper} ${msg.senderId === currentUser?.id ? styles.myMessage : styles.theirMessage}`}>
                            <div className={styles.avatarWrapper}>
                                {msg.senderPhoto ? <img src={msg.senderPhoto} className={styles.senderAvatar} /> : <div className={styles.fallbackAvatar}>{msg.senderName.charAt(0)}</div>}
                            </div>
                            {renderMessageContent(msg)}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputPanel}>
                    {replyingTo && (
                        <div className={styles.replyPreview}>
                            <div className={styles.replyInfo}>
                                <span className={styles.replySender}>Reponder a {replyingTo.senderName}</span>
                                <span className={styles.replyText}>{replyingTo.content}</span>
                            </div>
                            <button
                                className={styles.replyCloseBtn}
                                onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className={styles.inputControls}>
                        <div className={styles.inputWrapper}>
                            <button
                                className={styles.actionIcon}
                                onClick={(e) => { e.stopPropagation(); setIsEmojiPickerOpen(!isEmojiPickerOpen); }}
                                type="button"
                            >
                                <FaSmile />
                            </button>
                            <input
                                placeholder="Mensagem"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onFocus={() => setIsEmojiPickerOpen(false)}
                            />
                            <button
                                className={styles.actionIcon}
                                onClick={(e) => { e.stopPropagation(); setIsAttachMenuOpen(!isAttachMenuOpen); }}
                                type="button"
                            >
                                <FaPlus />
                            </button>
                        </div>

                        <button
                            className={styles.circleBtn}
                            onClick={newMessage.trim() ? handleSendText : () => setIsRecording(!isRecording)}
                            style={{ background: isRecording ? '#ef4444' : '#059669' }}
                        >
                            {newMessage.trim() ? <FaPaperPlane /> : <FaMicrophone />}
                        </button>
                    </div>

                    {isEmojiPickerOpen && (
                        <div className={styles.emojiPicker}>
                            {['😊', '😂', '❤️', '👍', '🙏', '🔥', '👏', '😮'].map(e => (
                                <span key={e} className={styles.emoji} onClick={() => setNewMessage(prev => prev + e)}>{e}</span>
                            ))}
                        </div>
                    )}

                    <AnimatePresence>
                        {isAttachMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className={styles.attachMenu}
                            >
                                <div className={styles.attachItem} onClick={() => handleAttach('image')}>
                                    <div className={styles.attachIcon} style={{ background: '#e0e7ff', color: '#4338ca' }}><FaImage /></div>
                                    <span>Fotos</span>
                                </div>
                                <div className={styles.attachItem} onClick={() => handleAttach('video')}>
                                    <div className={styles.attachIcon} style={{ background: '#fee2e2', color: '#b91c1c' }}><FaVideo /></div>
                                    <span>Vídeos</span>
                                </div>
                                <div className={styles.attachItem} onClick={() => handleAttach('file')}>
                                    <div className={styles.attachIcon} style={{ background: '#fef3c7', color: '#b45309' }}><FaFileAlt /></div>
                                    <span>Documentos</span>
                                </div>
                                <div className={styles.attachItem} onClick={() => handleAttach('location')}>
                                    <div className={styles.attachIcon} style={{ background: '#dcfce7', color: '#15803d' }}><FaMapMarkerAlt /></div>
                                    <span>Localização</span>
                                </div>
                                <div className={styles.attachItem} onClick={() => handleAttach('contact')}>
                                    <div className={styles.attachIcon} style={{ background: '#e0f2fe', color: '#0369a1' }}><FaUserPlus /></div>
                                    <span>Contacto</span>
                                </div>
                                <div className={styles.attachItem} onClick={() => { setIsAttachMenuOpen(false); setPollModalOpen(true); }}>
                                    <div className={styles.attachIcon} style={{ background: '#f3e8ff', color: '#7e22ce' }}><FaChartBar /></div>
                                    <span>Sondagem</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Sondagem */}
            {pollModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Criar Nova Sondagem</h3>
                        <input
                            placeholder="Pergunta da sondagem"
                            value={pollData.question}
                            onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
                        />
                        {pollData.options.map((opt, i) => (
                            <input
                                key={i}
                                placeholder={`Opção ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...pollData.options];
                                    newOpts[i] = e.target.value;
                                    setPollData({ ...pollData, options: newOpts });
                                }}
                            />
                        ))}
                        <button className={styles.addOptBtn} onClick={() => setPollData({ ...pollData, options: [...pollData.options, ''] })}>
                            + Adicionar Opção
                        </button>
                        <div className={styles.modalActions}>
                            <button onClick={() => setPollModalOpen(false)}>Cancelar</button>
                            <button className={styles.confirmBtn} onClick={() => {
                                sendMessage(pollData.question, 'poll', {
                                    options: pollData.options.filter(o => o.trim()).map(o => ({ text: o, votes: [] }))
                                });
                                setPollModalOpen(false);
                                setPollData({ question: '', options: ['', ''] });
                            }}>Criar Sondagem</button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.aside initial={{ x: 350 }} animate={{ x: 0 }} exit={{ x: 350 }} className={styles.settingsDrawer}>
                        <div className={styles.drawerHeader}>
                            <button
                                className={styles.drawerCloseBtn}
                                onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); }}
                            >
                                <FaTimes />
                            </button>
                            <h2>Definições do Chat</h2>
                        </div>

                        <div className={styles.drawerTabs}>
                            <button className={drawerTab === 'info' ? styles.activeTab : ''} onClick={() => setDrawerTab('info')}>Info</button>
                            <button className={drawerTab === 'media' ? styles.activeTab : ''} onClick={() => setDrawerTab('media')}>Mídia</button>
                            <button className={drawerTab === 'members' ? styles.activeTab : ''} onClick={() => setDrawerTab('members')}>Membros</button>
                        </div>

                        <div className={styles.drawerContent}>
                            {drawerTab === 'info' && (
                                <div className={styles.tabContent}>
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.sectionTitle}>Tema da Conversa</h3>
                                        <div className={styles.themeGrid}>
                                            {['default', 'blue', 'green', 'dark'].map(t => (
                                                <div
                                                    key={t}
                                                    className={`${styles.themeSwatch} ${styles[`swatch_${t}`]} ${chatTheme === t ? styles.activeTheme : ''}`}
                                                    onClick={() => setChatTheme(t)}
                                                    style={{ background: t === 'default' ? '#ffffff' : t === 'blue' ? '#3b82f6' : t === 'green' ? '#10b981' : '#0b141a' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.drawerSection}>
                                        <h3 className={styles.sectionTitle}>Descrição</h3>
                                        <p className={styles.drawerDesc}>Canal oficial de comunicação do sistema IPM360. Todos os arquivos e mensagens são persistidos localmente.</p>
                                    </div>
                                </div>
                            )}

                            {drawerTab === 'media' && (
                                <div className={styles.tabContent}>
                                    <h3 className={styles.sectionTitle}>Ficheiros e Mídia ({sharedMedia.length})</h3>
                                    <div className={styles.mediaListGrid}>
                                        {sharedMedia.map(m => (
                                            <div key={m.id} className={styles.mediaItemMini}>
                                                {m.type === 'image' ? <img src={m.content} /> : <div className={styles.filePlaceholder}><FaFileAlt /><span>{m.content}</span></div>}
                                            </div>
                                        ))}
                                    </div>
                                    <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Ligações (Links)</h3>
                                    <div className={styles.linksList}>
                                        {sharedLinks.map(l => (
                                            <div key={l.id} className={styles.linkItem}>
                                                <FaLink />
                                                <a href={l.content.match(/https?:\/\/[^\s]+/)?.[0]} target="_blank" rel="noreferrer">{l.content}</a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {drawerTab === 'members' && (
                                <div className={styles.tabContent}>
                                    <h3 className={styles.sectionTitle}>Membros ({employees.length})</h3>
                                    {employees.map(e => (
                                        <div key={e.id} className={styles.memberListItem}>
                                            {e.foto ? <img src={e.foto} /> : <div className={styles.memberFallback}>{e.nome[0]}</div>}
                                            <div className={styles.memberInfo}>
                                                <span className={styles.memberNameText}>{e.nome}</span>
                                                <span className={styles.memberRoleText}>{e.cargo}</span>
                                            </div>
                                        </div>
                                    ))}
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
