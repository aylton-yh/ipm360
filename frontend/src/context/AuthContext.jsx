import React, { createContext, useState, useEffect } from 'react';

const DEFAULT_ROLES = [
    {
        id: 1,
        nome: 'Administradores',
        descricao: 'Acesso total e irrestrito a todas as funções críticas do ecossistema.',
        color: 'red',
        usersCount: 0,
        permissoes: ['Gestão Estratégica', 'Controle Financeiro', 'Auditoria Full'],
        nivel: 'Estratégico',
        mfaStatus: 'Obrigatório',
        sessionLimit: 1,
        config: {
            dashboard: { 'Painel Executivo': true, 'Métricas Avançadas': true, 'Previsões': true, 'Exportar Widgets': true, 'Heatmaps': true },
            funcionarios: { 'Ver Lista': true, 'Cadastrar': true, 'Editar': true, 'Eliminar': true, 'Ver Salários': true, 'Contratos': true, 'Gerir Férias': true, 'Documentação': true },
            departamentos: { 'Visualizar': true, 'Gerir': true, 'Reestruturar': true, 'Orçamentos': true, 'Hierarquia': true },
            avaliacoes: { 'Realizar': true, 'Ver Histórico': true, 'Aprovar Ciclos': true, 'Configurar Metas': true, 'Calibração': true },
            financeiro: { 'Folha de Pagamento': true, 'Bônus & Prêmios': true, 'Benefícios': true, 'Reembolsos': true, 'Auditoria de Custos': true },
            relatorios: { 'Acessar': true, 'Customizar Dashboards': true, 'Agendar Envios': true, 'Analise de Retenção': true },
            comunicacao: { 'Mensagens Globais': true, 'Notificações Push': true, 'Pesquisas de Clima': true, 'Mural Empresa': true },
            sistema: { 'Permissões': true, 'Logs de Auditoria': true, 'Configurações': true, 'Backups': true, 'Integrações API': true, 'Licenciamento': true }
        }
    },
    {
        id: 2,
        nome: 'Gestores',
        descricao: 'Gestão tática de equipes, desempenho e fluxos operacionais de departamento.',
        color: 'blue',
        usersCount: 0,
        permissoes: ['Equipe & Performance', 'Relatórios Operacionais', 'Comunicação Interna'],
        nivel: 'Tático',
        mfaStatus: 'Obrigatório',
        sessionLimit: 3,
        config: {
            dashboard: { 'Painel Executivo': true, 'Métricas Avançadas': false, 'Previsões': false, 'Exportar Widgets': true, 'Heatmaps': false },
            funcionarios: { 'Ver Lista': true, 'Cadastrar': false, 'Editar': true, 'Eliminar': false, 'Ver Salários': false, 'Contratos': true, 'Gerir Férias': true, 'Documentação': false },
            departamentos: { 'Visualizar': true, 'Gerir': false, 'Reestruturar': false, 'Orçamentos': true, 'Hierarquia': true },
            avaliacoes: { 'Realizar': true, 'Ver Histórico': true, 'Aprovar Ciclos': false, 'Configurar Metas': true, 'Calibração': false },
            financeiro: { 'Folha de Pagamento': false, 'Bônus & Prêmios': true, 'Benefícios': true, 'Reembolsos': true, 'Auditoria de Custos': false },
            relatorios: { 'Acessar': true, 'Customizar Dashboards': false, 'Agendar Envios': false, 'Analise de Retenção': false },
            comunicacao: { 'Mensagens Globais': false, 'Notificações Push': true, 'Pesquisas de Clima': false, 'Mural Empresa': true },
            sistema: { 'Permissões': false, 'Logs de Auditoria': false, 'Configurações': true, 'Backups': false, 'Integrações API': false, 'Licenciamento': false }
        }
    },
    {
        id: 3,
        nome: 'Colaboradores',
        descricao: 'Acesso às ferramentas de autoatendimento, portal do colaborador e consultas básicas.',
        color: 'green',
        usersCount: 0,
        permissoes: ['Portal Colaborador', 'Auto-avaliação', 'Comunicações Pessoais'],
        nivel: 'Operacional',
        mfaStatus: 'Opcional',
        sessionLimit: 5,
        config: {
            dashboard: { 'Painel Executivo': false, 'Métricas Avançadas': false, 'Previsões': false, 'Exportar Widgets': false, 'Heatmaps': false },
            funcionarios: { 'Ver Lista': true, 'Cadastrar': false, 'Editar': false, 'Eliminar': false, 'Ver Salários': false, 'Contratos': false, 'Gerir Férias': false, 'Documentação': false },
            departamentos: { 'Visualizar': true, 'Gerir': false, 'Reestruturar': false, 'Orçamentos': false, 'Hierarquia': true },
            avaliacoes: { 'Realizar': false, 'Ver Histórico': false, 'Aprovar Ciclos': false, 'Configurar Metas': false, 'Calibração': false },
            financeiro: { 'Folha de Pagamento': false, 'Bônus & Prêmios': false, 'Benefícios': false, 'Reembolsos': false, 'Auditoria de Custos': false },
            relatorios: { 'Acessar': false, 'Customizar Dashboards': false, 'Agendar Envios': false, 'Analise de Retenção': false },
            comunicacao: { 'Mensagens Globais': false, 'Notificações Push': false, 'Pesquisas de Clima': false, 'Mural Empresa': true },
            sistema: { 'Permissões': false, 'Logs de Auditoria': false, 'Configurações': false, 'Backups': false, 'Integrações API': false, 'Licenciamento': false }
        }
    }
];

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Usuários Admin cadastrados (Inicia com o Global Admin)
    const [allAdmins, setAllAdmins] = useState(() => {
        const saved = localStorage.getItem('ipm360_admins');
        const defaultAdmin = {
            username: 'Aylton Dinis',
            password: '2004',
            nome: 'Aylton Dinis',
            cargo: 'Administrador Global',
            role: 'global_admin',
            id: 'global-1',
            status: 'approved'
        };

        if (saved) {
            const parsed = JSON.parse(saved);
            // Force update the global admin to ensure new credentials are effective
            const updated = parsed.map(admin =>
                (admin.id === 'global-1' || admin.role === 'global_admin' || admin.username === 'Aylton Dinis')
                    ? { ...defaultAdmin, id: admin.id || 'global-1' } // Keep ID but update everything else
                    : admin
            ).filter(a => a.username !== 'José Pires' && a.nome !== 'José Pires'); // Remove José Pires explicitly

            // If global admin was somehow deleted or missing from saved, add it back
            if (!updated.some(a => a.id === 'global-1' || a.role === 'global_admin' || a.username === 'Aylton Dinis')) {
                updated.unshift(defaultAdmin);
            }

            return updated;
        }

        return [defaultAdmin];
    });

    // Usuário Logado
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('ipm360_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const getApiUrl = (endpoint) => {
        const host = window.location.hostname;
        // Se estivermos no Vite (5173), tentamos o backend vindo do 8000
        // Se estivermos no 8000 (produção unificada), usamos a porta atual
        let port = window.location.port;
        if (port === '5173') port = '8000';
        const portStr = port ? `:${port}` : '';
        return `http://${host}${portStr}${endpoint}`;
    };

    const fetchMe = async () => {
        const token = localStorage.getItem('ipm360_token');
        if (!token) return;

        try {
            const response = await fetch(getApiUrl('/auth/me'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(prev => ({ ...prev, ...data }));
            } else {
                // Se o token for inválido/expirado, limpamos
                if (response.status === 401) {
                    localStorage.removeItem('ipm360_token');
                    setCurrentUser(null);
                }
            }
        } catch (e) {
            console.error("Erro ao buscar dados do utilizador:", e);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('ipm360_token')) {
            fetchMe();
        }
    }, []);

    // Notificações
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('ipm360_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    // Histórico de Pedidos de Admin
    const [adminHistory, setAdminHistory] = useState(() => {
        const saved = localStorage.getItem('ipm360_admin_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Perfis de Acesso (Roles)
    const [roles, setRoles] = useState(() => {
        const saved = localStorage.getItem('ipm360_roles');
        return saved ? JSON.parse(saved) : DEFAULT_ROLES;
    });

    // Lista de Colaboradores Registrados (Todos os usuários que não são admin)
    const [allUsers, setAllUsers] = useState(() => {
        const saved = localStorage.getItem('ipm360_users');
        const users = saved ? JSON.parse(saved) : [];
        // Filtro de segurança: Garantir que nenhum perfil de admin apareça como colaborador
        return users.filter(u => u.username !== 'Aylton Dinis' && u.nome !== 'Aylton Dinis' && (u.role === 'employee' || u.role === 'colaborador'));
    });

    // Estado Global de Processamento (Logout, Delete Account, etc)
    const [processingAction, setProcessingAction] = useState(null);

    // Persistência
    useEffect(() => {
        localStorage.setItem('ipm360_admins', JSON.stringify(allAdmins));
    }, [allAdmins]);

    useEffect(() => {
        localStorage.setItem('ipm360_current_user', JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('ipm360_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('ipm360_admin_history', JSON.stringify(adminHistory));
    }, [adminHistory]);

    useEffect(() => {
        localStorage.setItem('ipm360_roles', JSON.stringify(roles));
    }, [roles]);

    useEffect(() => {
        localStorage.setItem('ipm360_users', JSON.stringify(allUsers));
    }, [allUsers]);

    const login = async (username_or_email, password) => {
        try {
            const response = await fetch(getApiUrl('/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username_or_email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('ipm360_token', data.access_token);

                // Mapear dados para o formato esperado pelo frontend
                const loggedUser = {
                    username: data.user_name,
                    role: data.user_role,
                    id: data.user_id || data.user_name,
                    status: 'approved'
                };

                setCurrentUser(loggedUser);
                await fetchMe(); // Buscar dados completos imediatamente
                return { success: true, role: data.user_role, status: 'approved' };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.detail || 'Falha na autenticação' };
            }
        } catch (e) {
            console.error("Erro no login:", e);
            // Fallback para login local se o backend estiver offline (para não bloquear o utilizador)
            const localUser = allAdmins.find(a => a.username === username_or_email && a.password === password);
            if (localUser) {
                setCurrentUser(localUser);
                return { success: true, role: localUser.role, status: localUser.status };
            }
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const registerAdmin = async (userData) => {
        try {
            const response = await fetch(getApiUrl('/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,
                    nome_completo: userData.nome || userData.username,
                    role: 'admin'
                })
            });

            if (response.ok) {
                // Notificação local para o Global Admin (ainda mantida no state para UX instantânea)
                const notification = {
                    id: Date.now(),
                    type: 'new_registration',
                    message: `Novo pedido de Admin: ${userData.username}`,
                    read: false,
                    date: new Date().toISOString()
                };
                setNotifications(prev => [notification, ...prev]);

                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.detail || 'Erro ao registrar' };
            }
        } catch (e) {
            console.error("Erro no registro:", e);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    };

    const approveAdmin = (adminId) => {
        const admin = allAdmins.find(a => a.id === adminId);
        if (!admin) return;

        setAllAdmins(prev => prev.map(a => a.id === adminId ? { ...a, status: 'approved' } : a));

        // Atualizar Histórico
        setAdminHistory(prev => prev.map(h => h.adminId === adminId ? { ...h, status: 'approved' } : h));

        // Simulação de Email
        console.log(`[SIMULAÇÃO DE EMAIL] Enviando confirmação para ${admin.email}: "Seu acesso ao IPM360 foi aprovado!"`);
        alert(`Admin ${admin.username} aprovado! Notificação enviada para ${admin.email}`);

        // Remover a notificação correspondente
        setNotifications(prev => prev.filter(n => n.adminId !== adminId));
    };

    const rejectAdmin = (adminId) => {
        const admin = allAdmins.find(a => a.id === adminId);
        setAllAdmins(prev => prev.filter(a => a.id !== adminId));
        setNotifications(prev => prev.filter(n => n.adminId !== adminId));

        // Atualizar Histórico
        setAdminHistory(prev => prev.map(h => h.adminId === adminId ? { ...h, status: 'rejected' } : h));

        alert(`Pedido de ${admin?.username} recusado.`);
    };

    const disableAdmin = (id) => {
        setAllAdmins(prev => prev.map(a => a.id === id ? { ...a, status: 'disabled' } : a));
    };

    const enableAdmin = (id) => {
        setAllAdmins(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    };

    const deleteAdmin = (id) => {
        if (window.confirm('Tem certeza que deseja eliminar este administrador permanentemente?')) {
            setAllAdmins(prev => prev.filter(a => a.id !== id));
            setAdminHistory(prev => prev.filter(h => h.adminId !== id));
        }
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const updateCurrentUser = async (newData) => {
        if (!currentUser) return;

        const token = localStorage.getItem('ipm360_token');
        if (token && currentUser.role !== 'employee') {
            try {
                const response = await fetch(getApiUrl('/auth/update-profile'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        telefone: newData.telefone,
                        sobre: newData.sobre,
                        sexo: newData.sexo,
                        estado_civil: newData.estado_civil,
                        departamento: newData.departamento,
                        cargo: newData.cargo,
                        foto: newData.foto,
                        email: newData.email
                    })
                });

                if (response.ok) {
                    await fetchMe();
                    return { success: true };
                }
            } catch (e) {
                console.error("Erro ao atualizar perfil no servidor:", e);
            }
        }

        // Fallback or local update
        const updated = { ...currentUser, ...newData };
        setCurrentUser(updated);

        if (updated.role === 'employee' || updated.role === 'colaborador') {
            setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        } else {
            setAllAdmins(prev => prev.map(a => a.id === currentUser.id ? updated : a));
        }
        return { success: true };
    };

    const changePassword = async (current_password, new_password) => {
        const token = localStorage.getItem('ipm360_token');
        if (!token) return { success: false, message: 'Não autenticado: Sessão local ativa. Por favor, saia e entre novamente para ativar a sessão segura no servidor.' };

        try {
            const response = await fetch(getApiUrl('/auth/change-password'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password, new_password })
            });

            if (response.ok) {
                return { success: true };
            } else {
                const data = await response.json();
                return { success: false, message: data.detail || 'Erro ao alterar senha' };
            }
        } catch (e) {
            console.error("Erro ao alterar senha:", e);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    };

    const updateAdmin = (adminId, newData) => {
        setAllAdmins(prev => prev.map(a => a.id === adminId ? { ...a, ...newData } : a));
    };



    const deleteAdminHistoryItem = (historyId) => {
        setAdminHistory(prev => prev.filter(h => h.id !== historyId));
    };

    const clearAdminHistory = (silent = false) => {
        if (silent || window.confirm('Tem certeza que deseja apagar TODO o histórico do sistema?')) {
            setAdminHistory([]);
        }
    };

    const updateRole = (roleId, newData) => {
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...newData } : r));
    };

    const addRole = (newRole) => {
        const id = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
        setRoles(prev => [...prev, { ...newRole, id }]);
    };

    const deleteRole = (roleId) => {
        if (window.confirm('Tem certeza que deseja eliminar este perfil?')) {
            setRoles(prev => prev.filter(r => r.id !== roleId));
        }
    };



    const registerCollaborator = async (userData) => {
        try {
            const response = await fetch(getApiUrl('/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username || userData.email.split('@')[0],
                    email: userData.email,
                    password: userData.password,
                    nome_completo: userData.nome_completo || userData.nome,
                    role: 'colaborador'
                })
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.detail || 'Erro ao registrar colaborador' };
            }
        } catch (e) {
            console.error("Erro no registro de colaborador:", e);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    };

    const loginUser = async (email, password) => {
        // Para simplificar, usamos o mesmo endpoint de login geral que o Python backend oferece
        return login(email, password);
    };

    const deleteCurrentUser = async () => {
        if (!currentUser) return;

        // A lógica de UI (delay 5s) agora será controlada por quem chama ou pelo Layout observando 'processingAction'
        // Aqui fazemos apenas a remoção efetiva.

        const userId = currentUser.id;

        // 1. Remover do State Local
        if (currentUser.role === 'employee') {
            setAllUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            setAllAdmins(prev => prev.filter(a => a.id !== userId));
        }

        // 2. Tentar remover do Backend
        try {
            // await api.deleteUser(userId);
        } catch (e) { console.error(e); }

        // 3. Logout
        logout();
        setProcessingAction(null); // Limpa o estado global
    };

    const hasPermission = (module, action) => {
        if (!currentUser) return false;
        if (currentUser.role === 'global_admin') return true;

        // Encontrar o perfil do usuário
        const userRole = roles.find(r => r.nome === currentUser.role);
        if (!userRole) return false;

        return userRole.config[module]?.[action] || false;
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            allAdmins,
            notifications,
            login,
            logout,
            registerAdmin,
            markNotificationAsRead,
            clearNotifications,
            approveAdmin,
            rejectAdmin,
            disableAdmin,
            enableAdmin,
            deleteAdmin,
            adminHistory,
            loginUser,
            registerCollaborator,
            updateCurrentUser,
            deleteCurrentUser,
            processingAction, // State exposto para o Layout renderizar a tela
            setProcessingAction,
            deleteAdminHistoryItem,
            clearAdminHistory,
            roles,
            updateRole,
            addRole,
            deleteRole,
            updateAdmin,
            hasPermission,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
