const db = require('../config/db');

exports.submitAvaliacao = async (req, res) => {
    const { id_funcionario, ...notas } = req.body;
    try {
        // Mapear campos do frontend para a tabela 'nota'
        // Frontend parece enviar chaves como nomes de campos
        const [result] = await db.query(
            `INSERT INTO nota (id_funcionario, pontualidade, assiduidade, adaptacao, relacao_colegas, organizacao, etica_profissional, iniciativa, cumprimento_prazos)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_funcionario,
                notas.pontualidade || 0,
                notas.assiduidade || 0,
                notas.adaptacao || 0,
                notas.relacao_colegas || 0,
                notas.organizacao || 0,
                notas.etica_profissional || 0,
                notas.iniciativa || 0,
                notas.cumprimento_prazos || 0
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Avaliação submetida com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao submeter avaliação' });
    }
};

exports.getAvaliacaoHistory = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.*, f.nome_completo as funcionario
            FROM historico h
            LEFT JOIN funcionario f ON h.id_funcionario = f.id_funcionario
            ORDER BY h.data_hora DESC
        `);
        // Adaptar para o formato que o frontend espera se necessário
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar histórico de avaliações:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de avaliações', detail: error.message });
    }
};
