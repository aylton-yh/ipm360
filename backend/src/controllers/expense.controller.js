const db = require('../config/db');

exports.getAllExpenses = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, f.nome_completo as funcionario_nome 
            FROM expense e 
            LEFT JOIN funcionario f ON e.id_funcionario = f.id_funcionario 
            ORDER BY e.data DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
};

exports.createExpense = async (req, res) => {
    const { id_funcionario, categoria, descricao, valor, data, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO expense (id_funcionario, categoria, descricao, valor, data, status) VALUES (?, ?, ?, ?, ?, ?)',
            [id_funcionario, categoria, descricao, valor, data, status || 'Pendente']
        );
        res.status(201).json({ id: result.insertId, message: 'Despesa registrada com sucesso' });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(400).json({ error: 'Erro ao registrar despesa' });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { categoria, descricao, valor, data, status } = req.body;
    try {
        await db.query(
            'UPDATE expense SET categoria = ?, descricao = ?, valor = ?, data = ?, status = ? WHERE id = ?',
            [categoria, descricao, valor, data, status, id]
        );
        res.json({ message: 'Despesa atualizada com sucesso' });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(400).json({ error: 'Erro ao atualizar despesa' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM expense WHERE id = ?', [id]);
        res.json({ message: 'Despesa eliminada com sucesso' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(400).json({ error: 'Erro ao eliminar despesa' });
    }
};
