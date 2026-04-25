const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
    const { username_or_email, password } = req.body;

    try {
        let user = null;
        let table = '';

        // 1. Buscar no cadastro_admin primeiro
        const [adminRows] = await db.query(
            'SELECT id_cadastro_admin as id, username, email, senha_hash, role, status, theme FROM cadastro_admin WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) OR LOWER(TRIM(email)) = LOWER(TRIM(?))',
            [username_or_email, username_or_email]
        );
        console.log(`[LOGIN DEBUG] Admin search for "${username_or_email}": ${adminRows.length} found`);

        if (adminRows.length > 0) {
            user = adminRows[0];
            table = 'cadastro_admin';
        } else {
            // 2. Buscar no cadastro_usuario
            const [userRows] = await db.query(
                'SELECT id_cadastro_usuario as id, username, email, senha_hash, role, status, theme FROM cadastro_usuario WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) OR LOWER(TRIM(email)) = LOWER(TRIM(?))',
                [username_or_email, username_or_email]
            );
            console.log(`[LOGIN DEBUG] User search for "${username_or_email}": ${userRows.length} found`);
            if (userRows.length > 0) {
                user = userRows[0];
                table = 'cadastro_usuario';
            }
        }

        if (!user) {
            console.log(`[LOGIN] Usuário não encontrado: ${username_or_email}`);
            return res.status(401).json({ detail: 'Utilizador não encontrado' });
        }

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.senha_hash);
        console.log(`[LOGIN] Tentativa para ${user.username} (${table}). Password match: ${isMatch}`);
        if (!isMatch) {
            return res.status(401).json({ detail: 'Senha incorreta' });
        }

        // Verificar status da conta
        if (user.status === 'disabled' || user.status === 'blocked') {
            return res.status(403).json({ detail: 'Sua conta está desativada ou bloqueada. Contacte o administrador.' });
        }

        // Gerar Token (com a tabela real onde o usuário foi encontrado)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, table: table },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            access_token: token,
            token_type: 'bearer',
            user_id: user.id,
            user_name: user.username,
            user_role: user.role,
            user_table: table,
            user_theme: user.theme
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Erro interno no servidor' });
    }
};

// Obter dados do usuário logado (me)
exports.getMe = async (req, res) => {
    try {
        const { id, table } = req.user;
        let query = '';
        const params = [id];

        if (table === 'cadastro_admin') {
            query = `
                SELECT 
                    a.id_cadastro_admin as id, a.username, a.email, a.role, a.theme,
                    COALESCE(p.nome_completo, f.nome_completo) as nome_completo,
                    COALESCE(p.foto, f.img_path) as foto,
                    COALESCE(p.telefone, f.telefone) as telefone,
                    COALESCE(p.endereco, f.endereco) as endereco,
                    p.sobre, p.nacionalidade, p.naturalidade, p.formacao_academica, p.idiomas,
                    COALESCE(p.bi, f.bi) as bi,
                    COALESCE(p.sexo, f.genero) as sexo,
                    COALESCE(p.estado_civil, f.estado_civil) as estado_civil,
                    COALESCE(p.nascimento, f.data_nascimento) as nascimento,
                    COALESCE(p.departamento, d.nome_departamento) as departamento,
                    COALESCE(p.cargo, s.nome_seccao) as cargo
                FROM cadastro_admin a
                LEFT JOIN admin_perfil p ON a.id_cadastro_admin = p.id_cadastro_admin
                LEFT JOIN funcionario f ON p.id_funcionario = f.id_funcionario
                LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
                LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
                WHERE a.id_cadastro_admin = ?`;
        } else {
            query = `
                SELECT 
                    u.id_cadastro_usuario as id, u.username, u.email, u.role, u.theme,
                    COALESCE(p.nome_completo, f.nome_completo) as nome_completo,
                    COALESCE(p.foto, f.img_path) as foto,
                    COALESCE(p.telefone, f.telefone) as telefone,
                    COALESCE(p.endereco, f.endereco) as endereco,
                    p.sobre, p.nacionalidade, p.naturalidade, p.formacao_academica, p.idiomas,
                    COALESCE(p.bi, f.bi) as bi,
                    COALESCE(p.nascimento, f.data_nascimento) as nascimento,
                    COALESCE(p.sexo, f.genero) as sexo,
                    COALESCE(p.estado_civil, f.estado_civil) as estado_civil,
                    f.data_admissao as admissao,
                    f.codigo_identificacao as numeroAgente,
                    COALESCE(p.departamento, d.nome_departamento) as departamento,
                    COALESCE(p.cargo, s.nome_seccao) as cargo
                FROM cadastro_usuario u
                LEFT JOIN usuario_perfil p ON u.id_cadastro_usuario = p.id_cadastro_usuario
                LEFT JOIN funcionario f ON p.id_funcionario = f.id_funcionario
                LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
                LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
                WHERE u.id_cadastro_usuario = ?`;
        }

        const [rows] = await db.query(query, params);
        if (rows.length === 0) return res.status(404).json({ detail: 'Usuário não encontrado' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ detail: 'Erro ao buscar dados do usuário' });
    }
};

// Registro de Admin (pedido)
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const table = role === 'admin' ? 'cadastro_admin' : 'cadastro_usuario';

        const [userResult] = await db.query(
            `INSERT INTO ${table} (username, email, senha_hash, role) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, role || (table === 'cadastro_admin' ? 'admin' : 'funcionario')]
        );

        // Se for admin, criar notificação para o Global Admin
        if (role === 'admin' || table === 'cadastro_admin') {
            await db.query(
                `INSERT INTO notifications (message, type, user_id, is_global, link) VALUES (?, ?, ?, ?, ?)`,
                [`Um novo funcionário foi adicionado como Admin (Aguardando Aprovação): ${username}`, 'new_registration', null, 1, '/permissoes']
            );
        }

        res.status(201).json({ message: 'Registrado com sucesso. Aguarde aprovação.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ detail: 'Erro ao registrar. Verifique os dados.' });
    }
};

// Atualizar perfil
exports.updateProfile = async (req, res) => {
    const { id, role } = req.user;
    const data = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        if (role === 'admin' || role === 'global_admin') {
            // 1. Atualizar admin_perfil (ou criar se não existir)
            const [perfilExists] = await connection.query('SELECT 1 FROM admin_perfil WHERE id_cadastro_admin = ?', [id]);

            if (perfilExists.length === 0) {
                await connection.query(
                    `INSERT INTO admin_perfil (
                        id_cadastro_admin, nome_completo, telefone, endereco, sobre, 
                        foto, bi, sexo, estado_civil, nacionalidade, naturalidade, 
                        formacao_academica, idiomas, departamento, cargo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id, data.nome_completo || data.nome, data.telefone, data.endereco, data.sobre,
                        data.foto, data.bi, data.sexo, data.estado_civil,
                        data.nacionalidade, data.naturalidade, data.formacao_academica, data.idiomas,
                        data.departamento, data.cargo
                    ]
                );
            } else {
                await connection.query(
                    `UPDATE admin_perfil SET 
                        nome_completo = ?, telefone = ?, endereco = ?, sobre = ?, 
                        foto = ?, bi = ?, sexo = ?, estado_civil = ?,
                        nacionalidade = ?, naturalidade = ?, formacao_academica = ?, 
                        idiomas = ?, departamento = ?, cargo = ?
                     WHERE id_cadastro_admin = ?`,
                    [
                        data.nome_completo || data.nome, data.telefone, data.endereco, data.sobre,
                        data.foto, data.bi, data.sexo, data.estado_civil,
                        data.nacionalidade, data.naturalidade, data.formacao_academica,
                        data.idiomas, data.departamento, data.cargo,
                        id
                    ]
                );
            }

            // 2. Sincronizar com a tabela funcionario (se houver vínculo)
            await connection.query(
                `UPDATE funcionario f
                 JOIN admin_perfil ap ON f.id_funcionario = ap.id_funcionario
                 SET f.nome_completo = ?, f.telefone = ?, f.endereco = ?, f.bi = ?, 
                     f.genero = ?, f.estado_civil = ?, f.img_path = ?, f.email = COALESCE(?, f.email)
                 WHERE ap.id_cadastro_admin = ?`,
                [
                    data.nome_completo || data.nome, data.telefone, data.endereco, data.bi,
                    data.sexo, data.estado_civil, data.foto, data.email, id
                ]
            );

        } else {
            // 1. Atualizar usuario_perfil
            await connection.query(
                `UPDATE usuario_perfil SET 
                    nome_completo = ?, telefone = ?, endereco = ?, sobre = ?, 
                    foto = ?, sexo = ?, estado_civil = ?, departamento = ?, cargo = ?,
                    nacionalidade = ?, naturalidade = ?, formacao_academica = ?, idiomas = ?
                 WHERE id_cadastro_usuario = ?`,
                [
                    data.nome_completo || data.nome, data.telefone, data.endereco, data.sobre,
                    data.foto, data.sexo, data.estado_civil, data.departamento, data.cargo,
                    data.nacionalidade, data.naturalidade, data.formacao_academica, data.idiomas,
                    id
                ]
            );

            // 2. Sincronizar com a tabela funcionario
            await connection.query(
                `UPDATE funcionario f
                 JOIN usuario_perfil up ON f.id_funcionario = up.id_funcionario
                 SET f.nome_completo = ?, f.telefone = ?, f.endereco = ?, f.genero = ?, 
                     f.estado_civil = ?, f.img_path = ?, f.email = COALESCE(?, f.email)
                 WHERE up.id_cadastro_usuario = ?`,
                [
                    data.nome_completo || data.nome, data.telefone, data.endereco, data.sexo,
                    data.estado_civil, data.foto, data.email, id
                ]
            );
        }

        await connection.commit();
        res.json({ message: 'Perfil atualizado e sincronizado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error('ERRO_UPDATE_PROFILE:', error);
        res.status(500).json({ detail: 'Erro ao atualizar e sincronizar perfil' });
    } finally {
        connection.release();
    }
};

// Alterar senha
exports.changePassword = async (req, res) => {
    const { id, role } = req.user;
    const { current_password, new_password } = req.body;
    try {
        const table = (role === 'admin' || role === 'global_admin') ? 'cadastro_admin' : 'cadastro_usuario';
        const idCol = (role === 'admin' || role === 'global_admin') ? 'id_cadastro_admin' : 'id_cadastro_usuario';

        const [rows] = await db.query(`SELECT senha_hash FROM ${table} WHERE ${idCol} = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ detail: 'Usuário não encontrado' });

        const isMatch = await bcrypt.compare(current_password, rows[0].senha_hash);
        if (!isMatch) return res.status(400).json({ detail: 'Senha atual incorreta' });

        // Nova Regra: Apenas 4 dígitos numéricos
        const numericRegex = /^\d{4}$/;
        if (!numericRegex.test(new_password)) {
            return res.status(400).json({ detail: 'A nova senha deve conter exatamente 4 dígitos numéricos' });
        }

        const hashed = await bcrypt.hash(new_password, 10);
        await db.query(`UPDATE ${table} SET senha_hash = ? WHERE ${idCol} = ?`, [hashed, id]);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ detail: 'Erro ao alterar senha' });
    }
};

// Listar Admins (Todos que possuem role administrativo ou estão em cadastro_admin)
exports.getAllAdmins = async (req, res) => {
    try {
        // Buscar de cadastro_admin
        const [admins] = await db.query(`
            SELECT 
                a.id_cadastro_admin as id, a.username, a.email, a.role, a.status,
                ap.foto, ap.nome_completo, d.nome_departamento as departamento, 'admin_table' as source
            FROM cadastro_admin a
            LEFT JOIN admin_perfil ap ON a.id_cadastro_admin = ap.id_cadastro_admin
            LEFT JOIN funcionario f ON ap.id_funcionario = f.id_funcionario
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
        `);

        // Buscar de cadastro_usuario usuários que podem ser admins (ex: cargos táticos em roles customizadas)
        const [usersAsAdmins] = await db.query(`
            SELECT 
                u.id_cadastro_usuario as id, u.username, u.email, u.role, u.status,
                up.foto, up.nome_completo, d.nome_departamento as departamento, 'user_table' as source
            FROM cadastro_usuario u
            LEFT JOIN usuario_perfil up ON u.id_cadastro_usuario = up.id_cadastro_usuario
            LEFT JOIN funcionario f ON up.id_funcionario = f.id_funcionario
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            WHERE u.role IN ('admin', 'gestor')
        `);

        // Combinar e garantir unicidade (priorizando cadastro_admin se houver colisão de email/username)
        const all = [...admins, ...usersAsAdmins];
        const adminMap = new Map();

        all.forEach(item => {
            const key = (item.email || item.username || item.id || '').toString().toLowerCase();
            if (key) {
                // Se já existe e veio de admin_table, não sobrescrevemos com dados da user_table
                // (Para manter o nome_completo e foto que vêm do admin_perfil)
                if (!adminMap.has(key) || (item.source === 'admin_table')) {
                    adminMap.set(key, item);
                }
            }
        });

        const unique = Array.from(adminMap.values());
        res.json(unique);
    } catch (error) {
        console.error('ERRO_GET_ALL_ADMINS:', error);
        res.status(500).json({ detail: 'Erro ao buscar admins: ' + error.message });
    }
};

// Listar Usuários
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                u.id_cadastro_usuario as id, u.username, u.email, u.role, u.status,
                d.nome_departamento as departamento, up.nome_completo, up.foto
            FROM cadastro_usuario u
            LEFT JOIN usuario_perfil up ON u.id_cadastro_usuario = up.id_cadastro_usuario
            LEFT JOIN funcionario f ON up.id_funcionario = f.id_funcionario
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ detail: 'Erro ao buscar usuários' });
    }
};
// Atualizar Tema
exports.updateTheme = async (req, res) => {
    const { id, role } = req.user;
    const { theme } = req.body;
    try {
        const table = (role === 'admin' || role === 'global_admin') ? 'cadastro_admin' : 'cadastro_usuario';
        const idCol = (role === 'admin' || role === 'global_admin') ? 'id_cadastro_admin' : 'id_cadastro_usuario';

        await db.query(`UPDATE ${table} SET theme = ? WHERE ${idCol} = ?`, [theme, id]);
        res.json({ message: 'Tema atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ detail: 'Erro ao atualizar tema' });
    }
};
// Promover Funcionário a Admin
exports.promoteEmployeeToAdmin = async (req, res) => {
    const { funcionario_id } = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Buscar dados do funcionário
        const [empRows] = await connection.query('SELECT * FROM funcionario WHERE id_funcionario = ?', [funcionario_id]);
        if (empRows.length === 0) {
            throw new Error('Funcionário não encontrado');
        }
        const emp = empRows[0];

        // 2. Verificar se já existe em cadastro_admin
        const [adminRows] = await connection.query('SELECT id_cadastro_admin FROM cadastro_admin WHERE email = ?', [emp.email]);
        if (adminRows.length > 0) {
            return res.status(400).json({ detail: 'Este funcionário já possui uma conta de administrador' });
        }

        // 3. Buscar cadastro_usuario se existir
        const [userRows] = await connection.query('SELECT * FROM cadastro_usuario WHERE email = ?', [emp.email]);

        let username = emp.nome_completo.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100);
        let email = emp.email || `${username}@ipm360.com`;
        let senha_hash = emp.senha_hash || await bcrypt.hash('123456', 10); // Senha padrão se não houver
        let theme = 'dark';

        if (userRows.length > 0) {
            username = userRows[0].username;
            email = userRows[0].email;
            senha_hash = userRows[0].senha_hash;
            theme = userRows[0].theme;

            // Limpar tabelas de usuário comum
            const userId = userRows[0].id_cadastro_usuario;
            await connection.query('DELETE FROM usuario_perfil WHERE id_cadastro_usuario = ?', [userId]);
            await connection.query('DELETE FROM cadastro_usuario WHERE id_cadastro_usuario = ?', [userId]);
        }

        // 4. Criar em cadastro_admin
        const [newAdmin] = await connection.query(
            `INSERT INTO cadastro_admin (username, email, senha_hash, role, status, theme) VALUES (?, ?, ?, 'admin', 'approved', ?)`,
            [username, email, senha_hash, theme]
        );
        const adminId = newAdmin.insertId;

        // 5. Criar admin_perfil vinculado ao funcionário
        await connection.query(
            `INSERT INTO admin_perfil (id_cadastro_admin, id_funcionario, nome_completo, sexo, estado_civil, telefone, endereco, foto) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [adminId, funcionario_id, emp.nome_completo, emp.genero, emp.estado_civil, emp.telefone, emp.endereco, emp.img_path]
        );

        // 6. Notificar Promoção
        const promoter = req.user.username;
        await connection.query(
            `INSERT INTO notifications (message, type, user_id, is_global, link) VALUES (?, ?, ?, ?, ?)`,
            [`O funcionário ${emp.nome_completo} foi promovido a Administrador por ${promoter}`, 'promotion', null, 1, '/funcionarios']
        );

        await connection.commit();
        res.json({ message: 'Funcionário promovido com sucesso. Agora ele possui acesso total ao sistema.' });

    } catch (error) {
        await connection.rollback();
        console.error('ERRO_PROMOVER_ADMIN:', error);
        res.status(500).json({ detail: error.message || 'Erro ao processar promoção' });
    } finally {
        connection.release();
    }
};

// Funções auxiliares para migração de tabela
const moveAdminToUserTable = async (connection, adminId, newRole = 'funcionario') => {
    // 1. Pegar dados do admin
    const [adminRows] = await connection.query('SELECT * FROM cadastro_admin WHERE id_cadastro_admin = ?', [adminId]);
    if (adminRows.length === 0) return;
    const admin = adminRows[0];

    // 2. Pegar dados do perfil e do funcionário associado
    const [perfilRows] = await connection.query('SELECT * FROM admin_perfil WHERE id_cadastro_admin = ?', [adminId]);
    const perfil = perfilRows[0];

    // 3. Verificar se já existe em cadastro_usuario
    const [userExists] = await connection.query('SELECT id_cadastro_usuario FROM cadastro_usuario WHERE email = ?', [admin.email]);
    
    let userId;
    if (userExists.length === 0) {
        // Criar em cadastro_usuario
        const [newUser] = await connection.query(
            'INSERT INTO cadastro_usuario (username, email, senha_hash, role, status, theme) VALUES (?, ?, ?, ?, ?, ?)',
            [admin.username, admin.email, admin.senha_hash, newRole, admin.status, admin.theme]
        );
        userId = newUser.insertId;

        // Criar usuario_perfil
        if (perfil) {
            await connection.query(
                `INSERT INTO usuario_perfil (
                    id_cadastro_usuario, nome_completo, id_funcionario, email, bi, foto, 
                    telefone, endereco, sobre, sexo, estado_civil, departamento, cargo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, perfil.nome_completo, perfil.id_funcionario, admin.email, perfil.bi, perfil.foto,
                    perfil.telefone, perfil.endereco, perfil.sobre, perfil.sexo, perfil.estado_civil,
                    perfil.departamento, perfil.cargo
                ]
            );
        }
    } else {
        userId = userExists[0].id_cadastro_usuario;
        await connection.query('UPDATE cadastro_usuario SET role = ?, status = ? WHERE id_cadastro_usuario = ?', [newRole, admin.status, userId]);
    }

    // 4. Limpar de cadastro_admin
    await connection.query('DELETE FROM admin_perfil WHERE id_cadastro_admin = ?', [adminId]);
    await connection.query('DELETE FROM notifications WHERE admin_id = ?', [adminId]);
    await connection.query('DELETE FROM cadastro_admin WHERE id_cadastro_admin = ?', [adminId]);
};


// Atualizar Admin (Role e Status)
exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { role, status, username, email } = req.body;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        if (role === 'funcionario' || role === 'padrão') {
            // Mover para tabela de usuários comuns
            await moveAdminToUserTable(connection, id, 'funcionario');
            await connection.commit();
            return res.json({ message: 'Cargo atualizado e usuário movido para lista de funcionários.' });
        }

        // Atualização normal dentro da cadastro_admin
        await connection.query(
            'UPDATE cadastro_admin SET role = ?, status = ?, username = COALESCE(?, username), email = COALESCE(?, email) WHERE id_cadastro_admin = ?',
            [role, status, username || null, email || null, id]
        );
        
        await connection.commit();
        res.json({ message: 'Administrador atualizado com sucesso' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(400).json({ detail: 'Erro ao atualizar administrador' });
    } finally {
        if (connection) connection.release();
    }
};

// Eliminar Admin Permanente
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // Mover/Garantir que ele exista como funcionário antes de apagar o admin
        await moveAdminToUserTable(connection, id, 'funcionario');
        
        await connection.commit();
        res.json({ message: 'Acesso administrativo removido. O perfil agora é apenas de funcionário.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('ERRO_DELETE_ADMIN:', error);
        res.status(500).json({ detail: 'Erro ao remover acesso administrativo' });
    } finally {
        if (connection) connection.release();
    }
};

// Atualizar Usuário Comum (Bloquear/Desbloquear)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { status, role, username, email } = req.body;
    try {
        await db.query(
            'UPDATE cadastro_usuario SET status = ?, role = ?, username = COALESCE(?, username), email = COALESCE(?, email) WHERE id_cadastro_usuario = ?',
            [status, role || 'funcionario', username || null, email || null, id]
        );
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('ERRO_UPDATE_USER:', error);
        res.status(500).json({ detail: 'Erro ao atualizar usuário' });
    }
};

// Eliminar Usuário Permanente
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Obter email para limpar duplicatas em cadastro_admin
        const [userRows] = await connection.query('SELECT email, username FROM cadastro_usuario WHERE id_cadastro_usuario = ?', [id]);
        
        if (userRows.length > 0) {
            const { email, username } = userRows[0];
            
            // 2. Remover de cadastro_admin se houver duplicata
            await connection.query('DELETE FROM admin_perfil WHERE id_cadastro_admin IN (SELECT id_cadastro_admin FROM cadastro_admin WHERE email = ? OR username = ?)', [email, username]);
            await connection.query('DELETE FROM cadastro_admin WHERE email = ? OR username = ?', [email, username]);
        }

        // 3. Remover perfil e usuário comum
        await connection.query('DELETE FROM usuario_perfil WHERE id_cadastro_usuario = ?', [id]);
        await connection.query('DELETE FROM cadastro_usuario WHERE id_cadastro_usuario = ?', [id]);
        
        await connection.commit();
        res.json({ message: 'Usuário eliminado permanentemente em todos os registros' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('ERRO_DELETE_USER:', error);
        res.status(500).json({ detail: 'Erro ao eliminar usuário' });
    } finally {
        if (connection) connection.release();
    }
};
