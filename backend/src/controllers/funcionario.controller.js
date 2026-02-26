const db = require('../config/db');

// Listar todos os funcionários
exports.getAllFuncionarios = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT f.*, c.nome_seccao_cargo as cargo_nome 
      FROM funcionario f
      LEFT JOIN cargo c ON f.id_cargo = c.id_seccao_cargo
      ORDER BY f.nome_completo ASC
    `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }
};

// Criar novo funcionário
exports.createFuncionario = async (req, res) => {
    const { nome_completo, bi, codigo_identificacao, id_cargo, genero, email, telefone, endereco } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO funcionario (nome_completo, bi, codigo_identificacao, id_cargo, genero, email, telefone, endereco) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [nome_completo, bi, codigo_identificacao, id_cargo, genero, email, telefone, endereco]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao criar funcionário. Verifique se o e-mail ou BI já existem.' });
    }
};

// Buscar funcionário por ID
exports.getFuncionarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM funcionario WHERE id_funcionario = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar funcionário' });
    }
};
