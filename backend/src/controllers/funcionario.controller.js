const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Listar todos os funcionários
exports.getAllFuncionarios = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.*, s.nome_seccao as cargo_nome, d.nome_departamento as dept_nome
            FROM funcionario f
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            ORDER BY f.nome_completo ASC
        `);
        console.log(`[API] Funcionários encontrados: ${rows.length}`);
        res.json(rows);
    } catch (error) {
        console.error('[API ERROR] getAllFuncionarios:', error);
        res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }
};

// Criar novo funcionário com credenciais de acesso
exports.createFuncionario = async (req, res) => {
    const {
        nome_completo, bi, num_agente, id_cargo,
        genero, email, telefone, endereco,
        data_nascimento, estado_civil, data_admissao, status_funcionario,
        foto, username, password 
    } = req.body;

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Criar o funcionário
        const [empResult] = await connection.query(
            `INSERT INTO funcionario (
                nome_completo, bi, codigo_identificacao, num_agente, id_cargo, 
                genero, email, telefone, endereco, data_nascimento, 
                estado_civil, data_admissao, status_funcionario, img_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nome_completo, bi, num_agente, num_agente, id_cargo, 
                genero, email, telefone, endereco, data_nascimento, 
                estado_civil, data_admissao, status_funcionario || 'Ativo', foto
            ]
        );
        const funcionarioId = empResult.insertId;

        // 2. Credenciais
        if (username && password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userResult] = await connection.query(
                `INSERT INTO cadastro_usuario (username, email, senha_hash, role, status) VALUES (?, ?, ?, 'colaborador', 'ativo')`,
                [username, email, hashedPassword]
            );
            await connection.query(
                `INSERT INTO usuario_perfil (id_cadastro_usuario, nome_completo, id_funcionario, email, bi, foto, telefone, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userResult.insertId, nome_completo, funcionarioId, email, bi, foto, telefone, endereco]
            );
        }

        await connection.commit();
        res.status(201).json({ id: funcionarioId, message: 'Funcionário cadastrado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error('ERRO_CRIAR_FUNCIONARIO:', error);
        res.status(400).json({ error: `Erro ao cadastrar: ${error.message}` });
    } finally {
        connection.release();
    }
};

// Atualizar funcionário
exports.updateFuncionario = async (req, res) => {
    const { id } = req.params;
    const {
        nome_completo, bi, num_agente, id_cargo,
        genero, email, telefone, endereco,
        data_nascimento, estado_civil, data_admissao, status_funcionario,
        foto
    } = req.body;

    try {
        await db.query(
            `UPDATE funcionario SET 
                nome_completo = ?, bi = ?, codigo_identificacao = ?, num_agente = ?, 
                id_cargo = ?, genero = ?, email = ?, telefone = ?, endereco = ?, 
                data_nascimento = ?, estado_civil = ?, data_admissao = ?, 
                status_funcionario = ?, img_path = ? 
            WHERE id_funcionario = ?`,
            [
                nome_completo, bi, num_agente, num_agente, id_cargo, 
                genero, email, telefone, endereco, data_nascimento, 
                estado_civil, data_admissao, status_funcionario, foto, id
            ]
        );
        res.json({ message: 'Funcionário atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao atualizar funcionário' });
    }
};

// Eliminar funcionário
exports.deleteFuncionario = async (req, res) => {
    const { id } = req.params;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Buscar se tem usuário vinculado
        const [profiles] = await connection.query('SELECT id_cadastro_usuario FROM usuario_perfil WHERE id_funcionario = ?', [id]);
        
        // 2. Apagar cascade manual (conforme ipm360.sql as tabelas nota, resultado, historico podem estar vinculadas)
        await connection.query('DELETE FROM nota WHERE id_funcionario = ?', [id]);
        await connection.query('DELETE FROM resultado WHERE id_funcionario = ?', [id]);
        await connection.query('DELETE FROM historico WHERE id_funcionario = ?', [id]);
        await connection.query('DELETE FROM usuario_perfil WHERE id_funcionario = ?', [id]);
        
        if (profiles.length > 0) {
            await connection.query('DELETE FROM cadastro_usuario WHERE id_cadastro_usuario = ?', [profiles[0].id_cadastro_usuario]);
        }
        
        await connection.query('DELETE FROM funcionario WHERE id_funcionario = ?', [id]);

        await connection.commit();
        res.json({ message: 'Funcionário eliminado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ error: 'Erro ao eliminar funcionário' });
    } finally {
        connection.release();
    }
};

// Buscar funcionário por ID
exports.getFuncionarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM funcionario WHERE id_funcionario = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar funcionário' });
    }
};
