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

// Buscar funcionário por ID
exports.getFuncionarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT f.*, s.nome_seccao as cargo_nome, d.nome_departamento as dept_nome
            FROM funcionario f
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            WHERE f.id_funcionario = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Funcionário não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('[API ERROR] getFuncionarioById:', error);
        res.status(500).json({ error: 'Erro ao buscar funcionário' });
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
                nome_completo, bi || null, num_agente || null, num_agente || null, id_cargo,
                genero, email || null, telefone, endereco, data_nascimento,
                estado_civil, data_admissao, status_funcionario || 'Ativo', foto
            ]
        );
        const funcionarioId = empResult.insertId;

        // 2. Credenciais
        if (username && password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userResult] = await connection.query(
                `INSERT INTO cadastro_usuario (username, email, senha_hash, role, status) VALUES (?, ?, ?, 'funcionario', 'ativo')`,
                [username, email, hashedPassword]
            );

            // Buscar nomes de cargo e departamento para o perfil
            const [cargoRows] = await connection.query(`
                SELECT s.nome_seccao as cargo, d.nome_departamento as dept
                FROM seccao s
                JOIN departamento d ON s.id_departamento = d.id_departamento
                WHERE s.id_seccao = ?`, [id_cargo]);

            const cargoNome = cargoRows.length > 0 ? cargoRows[0].cargo : '';
            const deptNome = cargoRows.length > 0 ? cargoRows[0].dept : '';

            await connection.query(
                `INSERT INTO usuario_perfil (
                    id_cadastro_usuario, nome_completo, id_funcionario, email, bi, foto, 
                    telefone, endereco, sexo, estado_civil, nascimento, departamento, cargo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userResult.insertId, nome_completo, funcionarioId, email, bi || null, foto,
                    telefone, endereco, genero, estado_civil, data_nascimento, deptNome, cargoNome
                ]
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
    const updates = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Buscar dados atuais para manter consistência se necessário
        const [current] = await connection.query('SELECT * FROM funcionario WHERE id_funcionario = ?', [id]);
        if (current.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Funcionário não encontrado' });
        }

        const oldData = current[0];

        // 2. Construir Query Dinâmica para a tabela funcionario
        const fieldMap = {
            nome_completo: 'nome_completo',
            bi: 'bi',
            num_agente: 'num_agente',
            id_cargo: 'id_cargo',
            genero: 'genero',
            email: 'email',
            telefone: 'telefone',
            endereco: 'endereco',
            data_nascimento: 'data_nascimento',
            estado_civil: 'estado_civil',
            data_admissao: 'data_admissao',
            status_funcionario: 'status_funcionario',
            foto: 'img_path'
        };

        let queryParts = [];
        let queryValues = [];

        for (const [reqKey, dbKey] of Object.entries(fieldMap)) {
            if (updates[reqKey] !== undefined) {
                queryParts.push(`${dbKey} = ?`);
                queryValues.push(updates[reqKey]);

                // Ajuste especial para num_agente e codigo_identificacao
                if (reqKey === 'num_agente') {
                    queryParts.push(`codigo_identificacao = ?`);
                    queryValues.push(updates[reqKey]);
                }
            }
        }

        if (queryParts.length > 0) {
            const sql = `UPDATE funcionario SET ${queryParts.join(', ')} WHERE id_funcionario = ?`;
            queryValues.push(id);
            await connection.query(sql, queryValues);
        }

        // 3. Sincronizar com tabelas de login e perfis
        const { username, password } = updates;
        const newNome = updates.nome_completo || oldData.nome_completo;
        const newEmail = updates.email || oldData.email;
        const newCargoId = updates.id_cargo || oldData.id_cargo;

        // Se o cargo mudou, buscar os nomes para atualizar os perfis de string
        let newCargoNome = null;
        let newDeptNome = null;
        if (updates.id_cargo !== undefined && updates.id_cargo !== null) {
            const [cargoRows] = await connection.query(`
                SELECT s.nome_seccao, d.nome_departamento 
                FROM seccao s 
                JOIN departamento d ON s.id_departamento = d.id_departamento 
                WHERE s.id_seccao = ?`, [newCargoId]);
            if (cargoRows.length > 0) {
                newCargoNome = cargoRows[0].nome_seccao;
                newDeptNome = cargoRows[0].nome_departamento;
            }
        }

        // Atualizar usuario_perfil e cadastro_usuario
        const [userProfiles] = await connection.query('SELECT id_cadastro_usuario FROM usuario_perfil WHERE id_funcionario = ?', [id]);
        if (userProfiles.length > 0) {
            const loginId = userProfiles[0].id_cadastro_usuario;
            if (username) await connection.query('UPDATE cadastro_usuario SET username = ? WHERE id_cadastro_usuario = ?', [username, loginId]);
            if (updates.email) await connection.query('UPDATE cadastro_usuario SET email = ? WHERE id_cadastro_usuario = ?', [newEmail, loginId]);
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await connection.query('UPDATE cadastro_usuario SET senha_hash = ? WHERE id_cadastro_usuario = ?', [hashedPassword, loginId]);
            }
            
            // Atualizar Perfil (strings)
            let profileUpdateParts = ['nome_completo = ?', 'email = ?'];
            let profileUpdateValues = [newNome, newEmail];
            if (newCargoNome) {
                profileUpdateParts.push('cargo = ?', 'departamento = ?');
                profileUpdateValues.push(newCargoNome, newDeptNome);
            }
            profileUpdateValues.push(id);
            await connection.query(`UPDATE usuario_perfil SET ${profileUpdateParts.join(', ')} WHERE id_funcionario = ?`, profileUpdateValues);
        }

        // Atualizar admin_perfil e cadastro_admin
        const [adminProfiles] = await connection.query('SELECT id_cadastro_admin FROM admin_perfil WHERE id_funcionario = ?', [id]);
        if (adminProfiles.length > 0) {
            const loginId = adminProfiles[0].id_cadastro_admin;
            if (username) await connection.query('UPDATE cadastro_admin SET username = ? WHERE id_cadastro_admin = ?', [username, loginId]);
            if (updates.email) await connection.query('UPDATE cadastro_admin SET email = ? WHERE id_cadastro_admin = ?', [newEmail, loginId]);
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await connection.query('UPDATE cadastro_admin SET senha_hash = ? WHERE id_cadastro_admin = ?', [hashedPassword, loginId]);
            }
            
            // Atualizar Perfil (strings)
            let adminProfileParts = ['nome_completo = ?', 'email = ?'];
            let adminProfileValues = [newNome, newEmail];
            if (newCargoNome) {
                adminProfileParts.push('cargo = ?', 'departamento = ?');
                adminProfileValues.push(newCargoNome, newDeptNome);
            }
            adminProfileValues.push(id);
            await connection.query(`UPDATE admin_perfil SET ${adminProfileParts.join(', ')} WHERE id_funcionario = ?`, adminProfileValues);
        }

        await connection.commit();
        res.json({ message: 'Funcionário e credenciais atualizados com sucesso' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(400).json({ error: 'Erro ao atualizar funcionário e sincronizar credenciais' });
    } finally {
        if (connection) connection.release();
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

        const [empRows] = await connection.query('SELECT nome_completo FROM funcionario WHERE id_funcionario = ?', [id]);
        const employeeName = empRows[0]?.nome_completo || 'um funcionário';

        await connection.query('DELETE FROM funcionario WHERE id_funcionario = ?', [id]);

        // 3. Notificar deleção
        const adminName = req.user.username;
        await connection.query(
            `INSERT INTO notifications (message, type, user_id, is_global) VALUES (?, ?, ?, ?)`,
            [`O funcionário ${employeeName} foi eliminado do sistema por ${adminName}`, 'deletion', null, 1]
        );

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

// Promover/Transferir funcionário
exports.promoteFuncionario = async (req, res) => {
    const { id } = req.params;
    const { id_cargo, motivo } = req.body;
    const connection = await db.pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Buscar dados atuais para o histórico
        const [oldRows] = await connection.query(`
            SELECT f.*, s.nome_seccao as cargo, d.nome_departamento as dept, d.id_departamento as id_dept
            FROM funcionario f
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            WHERE f.id_funcionario = ?`, [id]);
        
        if (oldRows.length === 0) throw new Error('Funcionário não encontrado');
        const oldData = oldRows[0];

        // 2. Buscar novos dados (Cargo e Dept)
        const [newRows] = await connection.query(`
            SELECT s.nome_seccao as cargo, d.nome_departamento as dept, d.id_departamento as id_dept
            FROM seccao s
            JOIN departamento d ON s.id_departamento = d.id_departamento
            WHERE s.id_seccao = ?`, [id_cargo]);
        
        if (newRows.length === 0) throw new Error('Novo cargo não encontrado');
        const newDataInfo = newRows[0];

        // 3. Atualizar Funcionario
        await connection.query('UPDATE funcionario SET id_cargo = ? WHERE id_funcionario = ?', [id_cargo, id]);

        // 4. Sincronizar Perfis (usuário e admin se houver)
        await connection.query(
            'UPDATE usuario_perfil SET cargo = ?, departamento = ? WHERE id_funcionario = ?',
            [newDataInfo.cargo, newDataInfo.dept, id]
        );
        await connection.query(
            'UPDATE admin_perfil SET cargo = ?, departamento = ? WHERE id_funcionario = ?',
            [newDataInfo.cargo, newDataInfo.dept, id]
        );

        // 5. Gerar Histórico
        const evento = oldData.id_dept !== newDataInfo.id_dept ? 'Transferência' : 'Promoção';
        const payloadAnterior = JSON.stringify({ cargo: oldData.cargo, dept: oldData.dept });
        const payloadNovo = JSON.stringify({ 
            cargo: newDataInfo.cargo, 
            dept: newDataInfo.dept, 
            motivo: motivo || 'Progressão de carreira' 
        });

        await connection.query(
            `INSERT INTO historico (id_funcionario, id_departamento, evento, dados_anteriores, dados_novos) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, newDataInfo.id_dept, evento, payloadAnterior, payloadNovo]
        );

        // 6. Notificar
        await connection.query(
            `INSERT INTO notifications (message, type, user_id, is_global) 
             VALUES (?, ?, ?, ?)`,
            [`O funcionário ${oldData.nome_completo} foi movimentado para: ${newDataInfo.cargo} (${newDataInfo.dept}).`, 'promotion', null, 1]
        );

        await connection.commit();
        res.json({ 
            message: `${evento} realizada com sucesso`,
            newCargo: newDataInfo.cargo,
            newDept: newDataInfo.dept
        });
    } catch (error) {
        await connection.rollback();
        console.error('ERRO_PROMOÇÃO:', error);
        res.status(400).json({ error: error.message || 'Erro ao processar promoção' });
    } finally {
        connection.release();
    }
};
