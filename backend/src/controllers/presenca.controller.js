const db = require('../config/db');

// Marcar presença ou falta
exports.marcarPresenca = async (req, res) => {
    try {
        const { id_funcionario, status } = req.body;

        if (!id_funcionario || !status) {
            return res.status(400).json({ error: 'ID do funcionário e status são obrigatórios' });
        }

        // Verificar se já existe registro hoje para este funcionário
        const checkQuery = 'SELECT id_presenca, status FROM presenca WHERE id_funcionario = ? AND DATE(data_hora) = CURDATE()';
        const [existing] = await db.query(checkQuery, [id_funcionario]);

        if (existing && existing.length > 0) {
            return res.status(400).json({
                error: `Registro já realizado hoje (${existing[0].status}). Alterações não são permitidas.`
            });
        }

        // Inserir novo registro - data_hora usa DEFAULT CURRENT_TIMESTAMP
        const query = 'INSERT INTO presenca (id_funcionario, status) VALUES (?, ?)';
        await db.query(query, [id_funcionario, status]);

        res.status(201).json({ message: 'Presença registrada com sucesso' });
    } catch (error) {
        console.error('Erro ao marcar presença:', error);
        res.status(500).json({ error: 'Erro interno ao registrar presença' });
    }
};

// Obter histórico de presença de um funcionário
exports.getHistoricoFuncionario = async (req, res) => {
    try {
        const { id_funcionario } = req.params;

        const query = `
            SELECT id_presenca, status, data_hora 
            FROM presenca 
            WHERE id_funcionario = ? 
            ORDER BY data_hora DESC
        `;
        const [rows] = await db.query(query, [id_funcionario]);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar histórico de presença:', error);
        res.status(500).json({ error: 'Erro interno ao buscar histórico' });
    }
};

// Obter presenças de hoje para todos os funcionários
exports.getPresencaHoje = async (req, res) => {
    try {
        const query = `
            SELECT id_funcionario, status, data_hora 
            FROM presenca 
            WHERE DATE(data_hora) = CURDATE()
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar presenças de hoje:', error);
        res.status(500).json({ error: 'Erro interno ao buscar presenças' });
    }
};
