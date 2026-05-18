import React, { createContext, useState, useEffect, useContext } from 'react';

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
        nome: 'Funcionários',
        descricao: 'Acesso às ferramentas de autoatendimento, portal do funcionário e consultas básicas.',
        color: 'green',
        usersCount: 0,
        permissoes: ['Portal Funcionário', 'Auto-avaliação', 'Comunicações Pessoais'],
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
    // Usuários Admin cadastrados
    const [allAdmins, setAllAdmins] = useState(() => {
        const saved = localStorage.getItem('ipm360_admins');
        return saved ? JSON.parse(saved) : [];
    });

    // Usuário Logado
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('ipm360_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('ipm360_theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ipm360_theme', theme);
    }, [theme]);

    const getApiUrl = (endpoint) => {
        const host = window.location.hostname;
        // Se estivermos no Vite (qualquer porta diferente de 8000 e de vazia), tentamos o backend vindo do 8000
        // Se estivermos no 8000 (produção unificada), usamos a porta atual
        let port = window.location.port;
        if (port !== '8000' && port !== '') port = '8000';
        const portStr = port ? `:${port}` : '';
        return `http://${host}${portStr}${endpoint}`;
    };

    const fetchMe = async () => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;

        try {
            const response = await fetch(getApiUrl('/auth/me'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(prev => ({ ...prev, ...data }));
                if (data.theme) setTheme(data.theme);
            } else if (response.status === 401 || response.status === 404) {
                localStorage.removeItem('ipm360_token');
                sessionStorage.removeItem('ipm360_token');
                setCurrentUser(null);
            }
        } catch (e) {
            console.error("Erro ao buscar dados do utilizador:", e);
        }
    };

    const fetchSystemData = async () => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;

        try {
            const [adminsRes, usersRes, rolesRes, notifyRes] = await Promise.all([
                fetch(getApiUrl('/auth/admins'), { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(getApiUrl('/auth/users'), { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(getApiUrl('/api/system/roles'), { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(getApiUrl('/api/system/notifications'), { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (adminsRes.ok && usersRes.ok) {
                const adminsData = await adminsRes.json();
                const usersData = await usersRes.json();

                // O BACKEND já consolidou os admins (incluindo cargo e perfil) no endpoint /auth/admins
                setAllAdmins(adminsData);

                // Empregados/Usuários geríveis são todos exceto o Global Admin principal
                const employeeRoles = ['employee', 'funcionario', 'colaborador', 'admin', 'gestor', 'padrão'];
                setAllUsers(usersData.filter(u => {
                    const role = (u.role || '').toLowerCase().trim();
                    const isGlobal = role === 'global_admin' || u.username === 'Aylton Dinis';
                    return employeeRoles.includes(role) && !isGlobal;
                }));
            }

            if (rolesRes.ok) {
                const rolesData = await rolesRes.json();
                if (rolesData.length > 0) setRoles(rolesData);
            }
            if (notifyRes.ok) {
                const notifyData = await notifyRes.json();
                setNotifications(notifyData.map(n => ({
                    ...n,
                    date: n.date || new Date().toISOString()
                })));
            }
        } catch (e) {
            console.error("Erro ao buscar dados do sistema:", e);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (token) {
            fetchMe();
            fetchSystemData();
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

    // Lista de Funcionários Registrados (Todos os usuários que não são admin de alto nível)
    const [allUsers, setAllUsers] = useState(() => {
        const saved = localStorage.getItem('ipm360_users');
        const users = saved ? JSON.parse(saved) : [];
        // Filtro de segurança: Garantir que admins globais/gestores não apareçam na lista simples de funcionários
        return users.filter(u =>
            u.role !== 'global_admin' &&
            u.role !== 'gestor' &&
            u.username !== 'Aylton Dinis'
        );
    });

    // Estado Global de Processamento (Logout, Delete Account, etc)
    const [processingAction, setProcessingAction] = useState(null);

    // Os efeitos de persistência no localStorage foram removidos para favorecer o Banco de Dados.
    // Mantemos apenas para o currentUser como cache rápido de sessão se necessário.
    useEffect(() => {
        localStorage.setItem('ipm360_current_user', JSON.stringify(currentUser));
    }, [currentUser]);

    const login = async (username_or_email, password, remember = false) => {
        try {
            const response = await fetch(getApiUrl('/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username_or_email, password })
            });

            if (response.ok) {
                const data = await response.json();

                if (remember) {
                    localStorage.setItem('ipm360_token', data.access_token);
                } else {
                    sessionStorage.setItem('ipm360_token', data.access_token);
                }

                // Mapear dados para o formato esperado pelo frontend
                const loggedUser = {
                    username: data.user_name,
                    role: data.user_role,
                    id: data.user_id || data.user_name,
                    status: 'approved'
                };

                setCurrentUser(loggedUser);
                if (data.user_theme) setTheme(data.user_theme);
                await fetchMe(); // Buscar dados completos imediatamente
                return { success: true, role: data.user_role, status: 'approved' };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.detail || 'Falha na autenticação' };
            }
        } catch (e) {
            console.error("Erro no login:", e);
            return { success: false, message: 'Erro de conexão com o servidor. Verifique se o backend está rodando na porta 8000.' };
        }
    };

    const logout = () => {
        // Limpa tudo imediatamente para evitar inconsistências
        setCurrentUser(null);
        setProcessingAction(null);
        localStorage.removeItem('ipm360_token');
        sessionStorage.removeItem('ipm360_token');
        localStorage.removeItem('ipm360_current_user');
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
                    link: '/permissoes',
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

    const disableAdmin = async (id) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = allAdmins.find(a => a.id === id);
            if (!admin) return;
            await fetch(getApiUrl(`/auth/admins/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role: admin.role, status: 'disabled' })
            });
            await fetchSystemData();
        } catch (e) {
            console.error(e);
        }
    };

    const enableAdmin = async (id) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = allAdmins.find(a => a.id === id);
            if (!admin) return;
            await fetch(getApiUrl(`/auth/admins/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role: admin.role, status: 'approved' })
            });
            await fetchSystemData();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteAdmin = async (id) => {
        if (!window.confirm('Tem certeza que deseja eliminar este administrador permanentemente?')) return;
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = (allAdmins || []).find(a => a.id === id);
            // Se o admin vier da tabela de usuários, usamos o endpoint de usuários
            const endpoint = admin?.source === 'user_table' ? `/auth/users/${id}` : `/auth/admins/${id}`;
            
            const response = await fetch(getApiUrl(endpoint), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert('Acesso administrativo removido com sucesso.');
                await fetchSystemData();
            } else {
                const errorData = await response.json();
                alert(`Erro ao remover administrador: ${errorData.detail || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao remover administrador.');
        }
    };

    const disableUser = async (id) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            // Unificado: Tenta encontrar em admins primeiro (caso Helder)
            const admin = (allAdmins || []).find(a => a.id === id);
            if (admin) {
                return disableAdmin(id);
            }

            await fetch(getApiUrl(`/auth/users/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'disabled' })
            });
            await fetchSystemData();
        } catch (e) {
            console.error(e);
        }
    };

    const enableUser = async (id) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = (allAdmins || []).find(a => a.id === id);
            if (admin) {
                return enableAdmin(id);
            }

            await fetch(getApiUrl(`/auth/users/${id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'approved' })
            });
            await fetchSystemData();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Tem certeza que deseja eliminar este utilizador permanentemente?')) return;
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = (allAdmins || []).find(a => a.id === id);
            if (admin) {
                return deleteAdmin(id);
            }

            const response = await fetch(getApiUrl(`/auth/users/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert('Utilizador eliminado com sucesso.');
                await fetchSystemData();
            } else {
                const errorData = await response.json();
                alert(`Erro ao eliminar utilizador: ${errorData.detail || 'Erro desconhecido'}`);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao eliminar utilizador.');
        }
    };

    const markNotificationAsRead = async (id) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (token) {
            try {
                await fetch(getApiUrl(`/api/system/notifications/${id}/read`), {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.error("Erro ao marcar notificação como lida no servidor:", e);
            }
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const updateCurrentUser = async (newData) => {
        if (!currentUser) return;

        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (token) {
            try {
                const response = await fetch(getApiUrl('/auth/update-profile'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome_completo: newData.nome || newData.nome_completo,
                        telefone: newData.telefone,
                        sobre: newData.sobre,
                        sexo: newData.sexo,
                        estado_civil: newData.estado_civil || newData.estadoCivil,
                        departamento: newData.departamento || newData.dept,
                        cargo: newData.cargo,
                        foto: newData.foto,
                        email: newData.email,
                        bi: newData.bi,
                        nacionalidade: newData.nacionalidade,
                        naturalidade: newData.naturalidade,
                        formacao_academica: newData.formacao_academica,
                        idiomas: newData.idiomas
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

        if (updated.role === 'employee' || updated.role === 'funcionario') {
            setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        } else {
            setAllAdmins(prev => prev.map(a => a.id === currentUser.id ? updated : a));
        }
        return { success: true };
    };

    const changePassword = async (current_password, new_password) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
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

    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (token) {
            try {
                await fetch(getApiUrl('/auth/update-theme'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ theme: newTheme })
                });
            } catch (e) {
                console.error("Erro ao sincronizar tema com o servidor:", e);
            }
        }
    };

    const promoteEmployee = async (funcionarioId) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return { success: false, message: 'Não autenticado' };

        try {
            const response = await fetch(getApiUrl('/auth/promote-employee'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ funcionario_id: funcionarioId })
            });

            if (response.ok) {
                await fetchSystemData();
                return { success: true };
            } else {
                const data = await response.json();
                return { success: false, message: data.detail || 'Erro ao promover funcionário' };
            }
        } catch (e) {
            console.error("Erro ao promover funcionário:", e);
            return { success: false, message: 'Erro de conexão com o servidor' };
        }
    };

    const updateAdmin = async (adminId, newData) => {
        // Redireciona para o updateUser que já está unificado e preparado para ambas as fontes
        return updateUser(adminId, newData);
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
                    role: 'funcionario'
                })
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.detail || 'Erro ao registrar funcionário' };
            }
        } catch (e) {
            console.error("Erro no registro de funcionário:", e);
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

        // Regra de Ouro: Apenas o Administrador Global pode ver ou editar Permissões
        if (module === 'sistema' && action === 'Permissões') {
            return currentUser.role === 'global_admin';
        }

        if (currentUser.role === 'global_admin') return true;

        // Encontrar o perfil do usuário - Mapeamento Refinado
        // global_admin -> Administradores
        // gestor -> Gestores
        // admin / funcionario -> Funcionários
        const roleMap = {
            'global_admin': 'Administradores',
            'gestor': 'Gestores',
            'admin': 'Funcionários',
            'funcionario': 'Funcionários',
            'colaborador': 'Funcionários'
        };
        const targetRoleName = roleMap[currentUser.role] || currentUser.role;
        const userRole = roles.find(r => r.nome === targetRoleName);
        if (!userRole) return false;

        return userRole.config[module]?.[action] || false;
    };

    const updateUser = async (id, newData) => {
        const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
        if (!token) return;
        try {
            const admin = (allAdmins || []).find(a => a.id === id);
            const user = (allUsers || []).find(u => u.id === id);
            const target = admin || user;

            if (!target) return;

            const endpoint = admin ? `/auth/admins/${id}` : `/auth/users/${id}`;
            const body = admin 
                ? { role: newData.role || admin.role, status: newData.status || admin.status }
                : { status: newData.status || user.status, role: newData.role || user.role };

            await fetch(getApiUrl(endpoint), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            await fetchSystemData();
        } catch (e) {
            console.error(e);
        }
    };

    const value = {
        currentUser,
        allAdmins,
        allUsers,
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
        disableUser,
        enableUser,
        deleteUser,
        updateUser,
        adminHistory,
        loginUser,
        registerCollaborator,
        updateCurrentUser,
        deleteCurrentUser,
        processingAction,
        setProcessingAction,
        deleteAdminHistoryItem,
        clearAdminHistory,
        roles,
        updateRole,
        addRole,
        deleteRole,
        updateAdmin,
        hasPermission,
        changePassword,
        theme,
        updateTheme,
        promoteEmployee,
        getApiUrl,
        token: localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
