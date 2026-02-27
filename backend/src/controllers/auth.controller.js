const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
    const { username_or_email, password } = req.body;

    try {
        // Buscar no cadastro_admin ou cadastro_usuario (o frontend parece lidar com ambos)
        // Vamos simplificar buscando em ambas ou mapeando conforme o role

        let [userRows] = await db.query(
            'SELECT id_cadastro_admin as id, username, email, senha_hash, role, status FROM cadastro_admin WHERE username = ? OR email = ?',
            [username_or_email, username_or_email]
        );

        if (userRows.length === 0) {
            [userRows] = await db.query(
                'SELECT id_cadastro_usuario as id, username, email, senha_hash, role, status FROM cadastro_usuario WHERE username = ? OR email = ?',
                [username_or_email, username_or_email]
            );
        }

        if (userRows.length === 0) {
            return res.status(401).json({ detail: 'Utilizador não encontrado' });
        }

        const user = userRows[0];

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.senha_hash);
        if (!isMatch) {
            return res.status(401).json({ detail: 'Senha incorreta' });
        }

        // Gerar Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            access_token: token,
            token_type: 'bearer',
            user_id: user.id,
            user_name: user.username,
            user_role: user.role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Erro interno no servidor' });
    }
};

// Obter dados do usuário logado (me)
exports.getMe = async (req, res) => {
    try {
        const { id, role } = req.user;
        let query = '';
        let params = [id];

        if (role === 'admin' || role === 'global_admin') {
            query = `
                SELECT 
                    a.id_cadastro_admin as id, a.username, a.email, a.role,
                    p.nome_completo, p.foto, p.telefone, p.endereco, p.sobre
                FROM cadastro_admin a
                LEFT JOIN admin_perfil p ON a.id_cadastro_admin = p.id_cadastro_admin
                WHERE a.id_cadastro_admin = ?`;
        } else {
            query = `
                SELECT 
                    u.id_cadastro_usuario as id, u.username, u.email, u.role,
                    p.nome_completo, p.foto, p.telefone, p.endereco, p.sobre,
                    f.bi, f.data_admissao as admissao,
                    f.genero as sexo,
                    f.codigo_identificacao as numeroAgente,
                    c.nome_seccao_cargo as cargo
                FROM cadastro_usuario u
                LEFT JOIN usuario_perfil p ON u.id_cadastro_usuario = p.id_cadastro_usuario
                LEFT JOIN funcionario f ON p.id_funcionario = f.id_funcionario
                LEFT JOIN cargo c ON f.id_cargo = c.id_seccao_cargo
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

        await db.query(
            `INSERT INTO ${table} (username, email, senha_hash, role) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, role || (table === 'cadastro_admin' ? 'admin' : 'colaborador')]
        );

        res.status(201).json({ message: 'Registrado com sucesso. Aguarde aprovação.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ detail: 'Erro ao registrar. Verifique os dados.' });
    }
};
