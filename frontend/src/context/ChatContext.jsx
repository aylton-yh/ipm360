import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import { AuthContext } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: timestamp }
    const socketRef = useRef(null);
    const getChatUrl = (endpoint, isWs = false) => {
        const host = window.location.hostname;
        let port = window.location.port;
        if (port === '5173') port = '8000';
        const portStr = port ? `:${port}` : '';
        const protocol = isWs
            ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
            : (window.location.protocol === 'https:' ? 'https:' : 'http:');
        return `${protocol}//${host}${portStr}${endpoint}`;
    };

    const [lastSeen, setLastSeen] = useState(() => {
        const id = currentUser?.id || 'guest';
        return localStorage.getItem(`ipm360_chat_last_seen_${id}`) || new Date().toISOString();
    });
    const [chatTheme, setChatTheme] = useState(() => {
        const id = currentUser?.id || 'guest';
        return localStorage.getItem(`ipm360_chat_theme_${id}`) || 'default';
    });

    // Efeito para recarregar dados quando o utilizador muda (Login/Logout)
    useEffect(() => {
        if (currentUser?.id) {
            const savedLastSeen = localStorage.getItem(`ipm360_chat_last_seen_${currentUser.id}`);
            setLastSeen(savedLastSeen || new Date().toISOString());

            const savedTheme = localStorage.getItem(`ipm360_chat_theme_${currentUser.id}`);
            setChatTheme(savedTheme || 'default');
        } else {
            setLastSeen(new Date().toISOString());
            setChatTheme('default');
        }
    }, [currentUser?.id]);

    // Conexão WebSocket Real-time
    useEffect(() => {
        if (!currentUser?.id) return;

        // Limpa conexão anterior se houver
        if (socketRef.current) {
            socketRef.current.close();
        }

        const wsUrl = getChatUrl(`/ws/chat/${currentUser.id}`, true);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Conectado ao WebSocket do IPM360");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Se for uma nova mensagem do broadcast
            if (data.type !== 'typing') {
                setMessages(prev => {
                    // Evita duplicados (caso o remetente receba o seu próprio broadcast)
                    if (prev.some(m => m.id === data.id)) return prev;

                    const newMessage = {
                        id: data.id,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        senderRole: data.senderRole,
                        senderPhoto: data.senderPhoto,
                        type: data.type,
                        content: data.content,
                        metadata: data.metadata || {},
                        status: 'delivered',
                        timestamp: data.timestamp
                    };
                    return [...prev, newMessage];
                });
            }
        };

        socket.onclose = () => {
            console.log("Desconectado do WebSocket");
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [currentUser?.id]);

    // Carregar histórico inicial do banco de dados quando o utilizador entra
    useEffect(() => {
        if (!currentUser?.id) {
            setMessages([]);
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(getChatUrl('/chat/history'));
                if (response.ok) {
                    const history = await response.json();
                    setMessages(history);
                } else {
                    const saved = localStorage.getItem('ipm360_chat_messages');
                    if (saved) setMessages(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Erro ao carregar histórico do chat:", e);
                const saved = localStorage.getItem('ipm360_chat_messages');
                if (saved) setMessages(JSON.parse(saved));
            }
        };
        fetchHistory();
    }, [currentUser?.id]);

    // Salvar mensagens no localStorage sempre que mudarem
    useEffect(() => {
        localStorage.setItem('ipm360_chat_messages', JSON.stringify(messages));
    }, [messages]);

    // Salvar tema no localStorage
    useEffect(() => {
        if (currentUser?.id) {
            localStorage.setItem(`ipm360_chat_theme_${currentUser.id}`, chatTheme);
        }
    }, [chatTheme, currentUser?.id]);

    // Limpeza de usuários digitando (mock)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTypingUsers(prev => {
                const updated = { ...prev };
                let changed = false;
                Object.keys(updated).forEach(id => {
                    if (now - updated[id] > 3000) {
                        delete updated[id];
                        changed = true;
                    }
                });
                return changed ? updated : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = React.useCallback(() => {
        if (!currentUser?.id) return;
        const now = new Date().toISOString();
        setLastSeen(now);
        localStorage.setItem(`ipm360_chat_last_seen_${currentUser.id}`, now);

        setMessages(prev => {
            const hasUnread = prev.some(msg => msg.senderId !== currentUser.id && msg.status !== 'read');
            if (!hasUnread) return prev;
            return prev.map(msg => {
                if (msg.senderId !== currentUser.id && msg.status !== 'read') {
                    return { ...msg, status: 'read' };
                }
                return msg;
            });
        });
    }, [currentUser?.id]);

    const unreadCount = useMemo(() => {
        if (!currentUser) return 0;
        return messages.filter(msg =>
            msg.senderId !== currentUser.id &&
            new Date(msg.timestamp) > new Date(lastSeen)
        ).length;
    }, [messages, lastSeen, currentUser]);

    const sendMessage = React.useCallback((content, type = 'text', metadata = {}) => {
        if (!content && type === 'text') return;
        if (!currentUser) return;

        const messageData = {
            sender_name: currentUser.nome || currentUser.username,
            sender_role: currentUser.role,
            sender_photo: currentUser.foto || currentUser.avatar,
            type,
            content,
            metadata: {
                ...metadata,
                reactions: {},
                replyTo: metadata.replyTo || null
            }
        };

        // Envia via WebSocket para o backend persistir e fazer broadcast
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messageData));
        } else {
            console.error("WebSocket não está conectado.");
            // Fallback local se o socket falhar (opcional)
            const fallbackMsg = {
                ...messageData,
                id: Date.now(),
                senderId: currentUser.id,
                status: 'sent',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, fallbackMsg]);
        }

        markAsRead();
    }, [currentUser, markAsRead]);

    const setReaction = React.useCallback((messageId, emoji) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = { ...msg.metadata.reactions };
                const users = reactions[emoji] || [];

                if (users.includes(currentUser.id)) {
                    reactions[emoji] = users.filter(id => id !== currentUser.id);
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                    reactions[emoji] = [...users, currentUser.id];
                }

                return { ...msg, metadata: { ...msg.metadata, reactions } };
            }
            return msg;
        }));
    }, [currentUser?.id]);

    const setTypingStatus = React.useCallback((isTyping) => {
        if (!currentUser) return;
        if (isTyping) {
            setTypingUsers(prev => ({ ...prev, [currentUser.id]: Date.now() }));
        }
    }, [currentUser?.id]);

    const votePoll = React.useCallback((messageId, optionIndex) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId && msg.type === 'poll') {
                const newMetadata = { ...msg.metadata };
                newMetadata.options = newMetadata.options.map(opt => ({
                    ...opt,
                    votes: (opt.votes || []).filter(v => v !== currentUser.id)
                }));

                newMetadata.options[optionIndex].votes = [...newMetadata.options[optionIndex].votes, currentUser.id];

                return { ...msg, metadata: newMetadata };
            }
            return msg;
        }));
    }, [currentUser?.id]);

    const clearChat = React.useCallback(() => {
        if (currentUser?.role === 'global_admin') {
            setMessages([]);
            localStorage.setItem('ipm360_chat_messages', JSON.stringify([]));
            markAsRead();
        }
    }, [currentUser?.role, markAsRead]);

    return (
        <ChatContext.Provider value={{
            messages,
            unreadCount,
            chatTheme,
            typingUsers,
            setChatTheme,
            sendMessage,
            setReaction,
            setTypingStatus,
            votePoll,
            clearChat,
            markAsRead
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat deve ser usado dentro de um ChatProvider');
    }
    return context;
};
