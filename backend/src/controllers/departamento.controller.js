const db = require('../config/db');

// Listar todos os departamentos com suas seções
exports.getAllDepartamentos = async (req, res) => {
    try {
        const [depts] = await db.query('SELECT * FROM departamento');
        const [seccoes] = await db.query('SELECT * FROM seccao');

        const result = depts.map(d => ({
            id: d.id_departamento,
            nome: d.nome_departamento,
            head: d.responsavel_nome,
            color: d.cor,
            icon: d.icone,
            seccoes: seccoes
                .filter(s => s.id_departamento === d.id_departamento)
                .map(s => ({
                    id: s.id_seccao,
                    nome: s.nome_seccao
                }))
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar departamentos' });
    }
};

// Criar novo departamento
exports.createDepartamento = async (req, res) => {
    const { nome, head, color, icon, seccoes } = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        const [deptResult] = await connection.query(
            'INSERT INTO departamento (nome_departamento, responsavel_nome, cor, icone) VALUES (?, ?, ?, ?)',
            [nome, head, color, icon]
        );
        const deptId = deptResult.insertId;

        if (seccoes && seccoes.length > 0) {
            for (const secNome of seccoes) {
                await connection.query(
                    'INSERT INTO seccao (nome_seccao, id_departamento) VALUES (?, ?)',
                    [secNome, deptId]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id: deptId, message: 'Departamento criado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error('ERRO_AO_CRIAR_DEPARTAMENTO:', error);
        res.status(400).json({ error: `Erro ao criar departamento: ${error.message}` });
    } finally {
        connection.release();
    }
};

// Atualizar departamento
exports.updateDepartamento = async (req, res) => {
    const { id } = req.params;
    const { nome, head, color, icon, seccoes } = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE departamento SET nome_departamento = ?, responsavel_nome = ?, cor = ?, icone = ? WHERE id_departamento = ?',
            [nome, head, color, icon, id]
        );

        // Atualizar seções: remover antigas e inserir novas (abordagem simples)
        await connection.query('DELETE FROM seccao WHERE id_departamento = ?', [id]);
        if (seccoes && seccoes.length > 0) {
            for (const secNome of seccoes) {
                await connection.query(
                    'INSERT INTO seccao (nome_seccao, id_departamento) VALUES (?, ?)',
                    [secNome, id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Departamento atualizado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ error: 'Erro ao atualizar departamento' });
    } finally {
        connection.release();
    }
};

// Eliminar departamento
exports.deleteDepartamento = async (req, res) => {
    const { id } = req.params;
    try {
        // FK CASCADE deve lidar com seccoes se configurado, mas vamos manual para garantir
        await db.query('DELETE FROM seccao WHERE id_departamento = ?', [id]);
        await db.query('DELETE FROM departamento WHERE id_departamento = ?', [id]);
        res.json({ message: 'Departamento eliminado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao eliminar departamento' });
    }
};
