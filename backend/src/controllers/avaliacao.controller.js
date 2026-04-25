const db = require('../config/db');

exports.submitAvaliacao = async (req, res) => {
    const { id_funcionario, id_departamento, id_seccao_cargo, ...notas } = req.body;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Inserir na tabela 'nota' com TODOS os critérios
        const [notaResult] = await connection.query(
            `INSERT INTO nota (
                id_funcionario, id_departamento, id_seccao_cargo, id_avaliador,
                pontualidade, assiduidade, adaptacao, relacao_colegas, organizacao,
                etica_profissional, iniciativa, cumprimento_prazos,
                processo_ensino, aperfeicoamento, inovacao, responsabilidade, 
                relacao_humanas, actividades_extras, faltas, periodo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_funcionario,
                id_departamento || null,
                id_seccao_cargo || null,
                req.user.id, // ID do Admin logado
                notas.pontualidade || 0,
                notas.assiduidade || 0,
                notas.adaptacao || 0,
                notas.relacao_colegas || 0,
                notas.organizacao || 0,
                notas.etica_profissional || 0,
                notas.iniciativa || 0,
                notas.cumprimento_prazos || 0,
                notas.processo_ensino || 0,
                notas.aperfeicoamento || 0,
                notas.inovacao || 0,
                notas.responsabilidade || 0,
                notas.relacao_humanas || 0,
                notas.actividades_extras || 0,
                notas.faltas || 0,
                notas.periodo || 'Mensal'
            ]
        );

        // 2. Calcular Média de Performance por Grupos (Escala 0-20)
        // Grupo 1: Comportamental (4 itens)
        const g1Fields = ['pontualidade', 'assiduidade', 'adaptacao', 'relacao_colegas'];
        // Grupo 2: Técnico-Pedagógico (6 itens) - Apenas Docência
        const g2Fields = ['processo_ensino', 'aperfeicoamento', 'inovacao', 'responsabilidade', 'relacao_humanas', 'actividades_extras'];
        // Grupo 3: Profissional (4 itens)
        const g3Fields = ['organizacao', 'etica_profissional', 'iniciativa', 'cumprimento_prazos'];

        const calcAvg = (fields) => {
            const sum = fields.reduce((acc, f) => acc + (parseFloat(notas[f]) || 0), 0);
            return sum / fields.length;
        };

        const avgG1 = calcAvg(g1Fields);
        const avgG3 = calcAvg(g3Fields);

        let avg = 0;
        const isDocencia = id_departamento === 2; // Docência ID em ipm360.sql

        if (isDocencia) {
            const avgG2 = calcAvg(g2Fields);
            avg = (avgG1 + avgG2 + avgG3) / 3;
        } else {
            avg = (avgG1 + avgG3) / 2;
        }

        // 3. Determinar Qualitativo (Escala 0-20)
        let qualitative = 'Mau';
        if (avg >= 18) qualitative = 'Muito Bom';
        else if (avg >= 14) qualitative = 'Bom';
        else if (avg >= 10) qualitative = 'Razoável';

        // 4. Inserir na tabela 'resultado' vinculando a 'nota'
        const [resResult] = await connection.query(
            `INSERT INTO resultado (id_funcionario, id_nota, classificacao_quantitativa, qualitativa) VALUES (?, ?, ?, ?)`,
            [id_funcionario, notaResult.insertId, avg, qualitative]
        );

        // 5. Inserir no 'historico' com detalhes do cálculo
        const quantStr = `${avg.toFixed(1)}/20`;
        await connection.query(
            `INSERT INTO historico (id_funcionario, id_resultado, id_departamento, evento, dados_novos) VALUES (?, ?, ?, ?, ?)`,
            [
                id_funcionario,
                resResult.insertId,
                id_departamento || null,
                'avaliacao',
                JSON.stringify({
                    tipo: 'avaliacao',
                    resultadoQuantitativo: quantStr,
                    resultadoQualitativo: qualitative,
                    score: avg,
                    faltas: notas.faltas || 0,
                    periodo: notas.periodo || 'Mensal',
                    isDocencia: isDocencia,
                    data_conclusao: new Date().toISOString()
                })
            ]
        );

        // 6. Notificação Global em tempo real
        const [empName] = await connection.query('SELECT nome_completo FROM funcionario WHERE id_funcionario = ?', [id_funcionario]);
        const adminName = req.user.username;
        // 6. Notificação Direta para o funcionário avaliado
        const [empUser] = await connection.query('SELECT id_cadastro_usuario FROM usuario_perfil WHERE id_funcionario = ?', [id_funcionario]);
        if (empUser[0]?.id_cadastro_usuario) {
            await connection.query(
                `INSERT INTO notifications (message, type, user_id, is_global, link, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [`Sua avaliação de desempenho foi concluída por ${adminName}.`, 'evaluation', empUser[0].id_cadastro_usuario, 0, '/minhas-avaliacoes', notaResult.insertId]
            );
        }

        // Notificação Global para Admins (Opcional, mas vamos manter como global para quem tem permissão)
        await connection.query(
            `INSERT INTO notifications (message, type, user_id, is_global, link) VALUES (?, ?, ?, ?, ?)`,
            [`O administrador ${adminName} realizou uma avaliação para ${empName[0]?.nome_completo || 'um funcionário'}`, 'evaluation', null, 1, '/historicos']
        );

        await connection.commit();
        res.status(201).json({ id: notaResult.insertId, message: 'Avaliação submetida com sucesso', score: avg });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ error: 'Erro ao submeter avaliação' });
    } finally {
        connection.release();
    }
};

exports.getAvaliacaoHistory = async (req, res) => {
    try {
        // Buscar histórico real com critérios da tabela 'nota'
        const [historyRows] = await db.query(`
            SELECT h.*, f.nome_completo as funcionario, f.img_path as foto, d.nome_departamento as dept,
                   n.pontualidade, n.assiduidade, n.adaptacao, n.relacao_colegas, n.organizacao,
                   n.etica_profissional, n.iniciativa, n.cumprimento_prazos,
                   n.processo_ensino, n.aperfeicoamento, n.inovacao, n.responsabilidade,
                   n.relacao_humanas, n.actividades_extras, n.faltas, n.periodo,
                   adm.username as avaliador_nome,
                   fb.satisfacao as feedback_status, fb.motivo as feedback_motivo,
                   fb.resposta_admin, fb.respondido_em
            FROM historico h
            LEFT JOIN funcionario f ON h.id_funcionario = f.id_funcionario
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
            LEFT JOIN resultado res ON h.id_resultado = res.id_resultado
            LEFT JOIN nota n ON res.id_nota = n.id_nota
            LEFT JOIN cadastro_admin adm ON n.id_avaliador = adm.id_cadastro_admin
            LEFT JOIN feedback_avaliacoes fb ON n.id_nota = fb.id_nota
            GROUP BY h.id_historico
            ORDER BY h.data_hora DESC
        `);

        // Buscar participações pendentes
        const [pendingRows] = await db.query(`
            SELECT pa.id_participacao as id, f.nome_completo as funcionario, f.id_funcionario as funcionarioId, 
                   'participacao' as evento, pa.status as resultadoQualitativo, pa.id_ciclo
            FROM participacao_avaliacao pa
            JOIN funcionario f ON pa.id_funcionario = f.id_funcionario
            WHERE pa.status = 'Pendente'
        `);

        // Formatar histórico real
        const formattedHistory = historyRows.map(r => {
            const extra = typeof r.dados_novos === 'string' ? JSON.parse(r.dados_novos) : r.dados_novos;

            // Adicionar critérios se existirem
            const criterios = [
                { nome: 'Pontualidade', nota: r.pontualidade },
                { nome: 'Assiduidade', nota: r.assiduidade },
                { nome: 'Adaptação', nota: r.adaptacao },
                { nome: 'Relação com Colegas', nota: r.relacao_colegas },
                { nome: 'Organização', nota: r.organizacao },
                { nome: 'Ética Profissional', nota: r.etica_profissional },
                { nome: 'Iniciativa', nota: r.iniciativa },
                { nome: 'Cumprimento de Prazos', nota: r.cumprimento_prazos }
            ];

            // Adicionar critérios técnicos se não forem nulos/zero
            if (r.processo_ensino > 0) criterios.push({ nome: 'Processo Ensino', nota: r.processo_ensino });
            if (r.aperfeicoamento > 0) criterios.push({ nome: 'Aperfeiçoamento', nota: r.aperfeicoamento });
            if (r.inovacao > 0) criterios.push({ nome: 'Inovação', nota: r.inovacao });
            if (r.responsabilidade > 0) criterios.push({ nome: 'Responsabilidade', nota: r.responsabilidade });
            if (r.relacao_humanas > 0) criterios.push({ nome: 'Relações Humanas', nota: r.relacao_humanas });
            if (r.actividades_extras > 0) criterios.push({ nome: 'Actividades Extras', nota: r.actividades_extras });

            return {
                id: r.id_historico,
                funcionario: r.funcionario || 'Sistema',
                foto: r.foto,
                funcionarioId: r.id_funcionario,
                evento: r.evento,
                data: r.data_hora,
                avaliador: r.avaliador_nome || 'Admin',
                feedback: r.feedback_status !== null ? {
                    satisfacao: r.feedback_status,
                    motivo: r.feedback_motivo,
                    resposta: r.resposta_admin,
                    respondido_em: r.respondido_em
                } : null,
                criterios: criterios.filter(c => c.nota !== null),
                ...extra
            };
        });

        // Formatar pendentes
        const formattedPending = pendingRows.map(p => ({
            ...p,
            tipo: 'avaliacao', // Para o dashboard filtrar
            data: new Date().toISOString()
        }));

        res.json([...formattedPending, ...formattedHistory]);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        await db.query('DELETE FROM historico');
        await db.query('DELETE FROM nota');
        await db.query('DELETE FROM resultado');
        res.json({ message: 'Histórico limpo com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao limpar histórico' });
    }
};

exports.deleteHistoryItem = async (req, res) => {
    const { id } = req.params;
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Buscar se existe um id_resultado associado
        const [rows] = await connection.query('SELECT id_resultado FROM historico WHERE id_historico = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        const id_resultado = rows[0].id_resultado;
        let id_nota = null;

        // 2. Se houver resultado, buscar id_nota
        if (id_resultado) {
            const [resRows] = await connection.query('SELECT id_nota FROM resultado WHERE id_resultado = ?', [id_resultado]);
            if (resRows.length > 0) id_nota = resRows[0].id_nota;
        }

        // 3. Eliminar dependências de Feedback e Notificações (IMPORTANT: Antes de deletar registros pai)
        if (id_nota) {
            await connection.query('DELETE FROM feedback_mensagens WHERE id_nota = ?', [id_nota]);
            await connection.query('DELETE FROM feedback_avaliacoes WHERE id_nota = ?', [id_nota]);
            await connection.query('DELETE FROM notifications WHERE link_id = ? AND type IN ("evaluation", "feedback", "reply")', [id_nota]);
        }

        // 4. Eliminar do histórico
        await connection.query('DELETE FROM historico WHERE id_historico = ?', [id]);

        // 5. Eliminar resultado (se houver)
        if (id_resultado) {
            await connection.query('DELETE FROM resultado WHERE id_resultado = ?', [id_resultado]);
        }

        // 6. Eliminar nota (se houver)
        if (id_nota) {
            await connection.query('DELETE FROM nota WHERE id_nota = ?', [id_nota]);
        }

        await connection.commit();
        res.json({ message: 'Relatório eliminado com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Erro ao eliminar relatório' });
    } finally {
        connection.release();
    }
};

// Obter estatísticas do Usuário (para o User Home)
exports.getMyStats = async (req, res) => {
    try {
        const { id, role } = req.user;
        let funcionarioId = null;

        // Descobrir o id_funcionario vinculado ao usuário logado
        if (role === 'admin' || role === 'global_admin') {
            const [rows] = await db.query('SELECT id_funcionario FROM admin_perfil WHERE id_cadastro_admin = ?', [id]);
            funcionarioId = rows[0]?.id_funcionario;
        } else {
            const [rows] = await db.query('SELECT id_funcionario FROM usuario_perfil WHERE id_cadastro_usuario = ?', [id]);
            funcionarioId = rows[0]?.id_funcionario;
        }

        if (!funcionarioId) {
            return res.json({ totalEvaluations: 0, avgScore: 0, pending: 0, history: [] });
        }

        // 1. Total de avaliações e Média
        const [statsRows] = await db.query(
            `SELECT COUNT(*) as total, AVG(classificacao_quantitativa) as avg 
             FROM resultado WHERE id_funcionario = ?`,
            [funcionarioId]
        );

        // 2. Pendentes (Participações)
        const [pendingRows] = await db.query(
            `SELECT COUNT(*) as pending FROM participacao_avaliacao 
             WHERE id_funcionario = ? AND status = 'Pendente'`,
            [funcionarioId]
        );

        // 3. Histórico recente (para o gráfico)
        const [historyRows] = await db.query(
            `SELECT classificacao_quantitativa as score, qualitativa, criado_em as data 
             FROM resultado WHERE id_funcionario = ? ORDER BY id_resultado DESC LIMIT 6`,
            [funcionarioId]
        );

        // 3.5. Faltas REAIS (da tabela presenca do Admin)
        const [absencesRows] = await db.query(
            `SELECT COUNT(*) as absencesCount FROM presenca 
             WHERE id_funcionario = ? AND status = 'Faltou'`,
            [funcionarioId]
        );

        // 4. Critérios da última avaliação (detalhado) via link id_nota
        const [latestEvalCriteria] = await db.query(
            `SELECT n.pontualidade, n.assiduidade, n.adaptacao, n.relacao_colegas, n.organizacao,
                    n.etica_profissional, n.iniciativa, n.cumprimento_prazos,
                    n.processo_ensino, n.aperfeicoamento, n.inovacao, n.responsabilidade,
                    n.relacao_humanas, n.actividades_extras, n.faltas, n.periodo
             FROM resultado res
             JOIN nota n ON res.id_nota = n.id_nota
             WHERE res.id_funcionario = ?
             ORDER BY res.id_resultado DESC LIMIT 1`,
            [funcionarioId]
        );

        let latestCriteriaList = [];
        if (latestEvalCriteria.length > 0) {
            const row = latestEvalCriteria[0];
            const criteria = [
                { nome: 'Pontualidade', nota: row.pontualidade },
                { nome: 'Assiduidade', nota: row.assiduidade },
                { nome: 'Adaptação', nota: row.adaptacao },
                { nome: 'Relação com Colegas', nota: row.relacao_colegas },
                { nome: 'Organização', nota: row.organizacao },
                { nome: 'Ética Profissional', nota: row.etica_profissional },
                { nome: 'Iniciativa', nota: row.iniciativa },
                { nome: 'Cumprimento de Prazos', nota: row.cumprimento_prazos }
            ];
            if (row.processo_ensino > 0) criteria.push({ nome: 'Processo Ensino', nota: row.processo_ensino });
            if (row.aperfeicoamento > 0) criteria.push({ nome: 'Aperfeiçoamento', nota: row.aperfeicoamento });
            if (row.inovacao > 0) criteria.push({ nome: 'Inovação', nota: row.inovacao });
            if (row.responsabilidade > 0) criteria.push({ nome: 'Responsabilidade', nota: row.responsabilidade });
            if (row.relacao_humanas > 0) criteria.push({ nome: 'Relações Humanas', nota: row.relacao_humanas });
            if (row.actividades_extras > 0) criteria.push({ nome: 'Actividades Extras', nota: row.actividades_extras });

            latestCriteriaList = criteria.filter(c => c.nota !== null);
        }

        res.json({
            totalEvaluations: statsRows[0].total || 0,
            avgScore: parseFloat(statsRows[0].avg || 0).toFixed(1),
            pending: pendingRows[0].pending || 0,
            absencesCount: absencesRows[0].absencesCount || 0,
            recentScores: historyRows.reverse(),
            latestCriteria: latestCriteriaList
        });

    } catch (error) {
        console.error('Erro ao buscar stats do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
};

// Obter apenas as MINHAS avaliações
exports.getMyEvaluations = async (req, res) => {
    try {
        const { id, role } = req.user;
        let funcionarioId = null;

        if (role === 'admin' || role === 'global_admin') {
            const [rows] = await db.query('SELECT id_funcionario FROM admin_perfil WHERE id_cadastro_admin = ?', [id]);
            funcionarioId = rows[0]?.id_funcionario;
        } else {
            const [rows] = await db.query('SELECT id_funcionario FROM usuario_perfil WHERE id_cadastro_usuario = ?', [id]);
            funcionarioId = rows[0]?.id_funcionario;
        }

        if (!funcionarioId) return res.json([]);

        const [rows] = await db.query(
            `SELECT h.*, f.nome_completo as funcionario, d.nome_departamento as dept, n.id_nota,
                    n.pontualidade, n.assiduidade, n.adaptacao, n.relacao_colegas, n.organizacao,
                    n.etica_profissional, n.iniciativa, n.cumprimento_prazos,
                    n.processo_ensino, n.aperfeicoamento, n.inovacao, n.responsabilidade,
                    n.relacao_humanas, n.actividades_extras, n.faltas, n.periodo,
                    fa.satisfacao, fa.motivo, fa.resposta_admin, fa.respondido_em,
                    adm.username as avaliador_nome
             FROM historico h
             JOIN funcionario f ON h.id_funcionario = f.id_funcionario
             LEFT JOIN resultado res ON h.id_resultado = res.id_resultado
             LEFT JOIN nota n ON res.id_nota = n.id_nota
             LEFT JOIN departamento d ON n.id_departamento = d.id_departamento
             LEFT JOIN cadastro_admin adm ON n.id_avaliador = adm.id_cadastro_admin
             LEFT JOIN feedback_avaliacoes fa ON n.id_nota = fa.id_nota
             WHERE h.id_funcionario = ? AND h.evento = 'avaliacao'
             GROUP BY h.id_historico
             ORDER BY h.data_hora DESC`,
            [funcionarioId]
        );

        const formatted = rows.map(r => {
            const extra = typeof r.dados_novos === 'string' ? JSON.parse(r.dados_novos) : r.dados_novos;

            // Adicionar status do feedback
            const feedback = (r.satisfacao !== null && r.satisfacao !== undefined) ? {
                satisfacao: r.satisfacao,
                motivo: r.motivo,
                resposta_admin: r.resposta_admin,
                respondido_em: r.respondido_em
            } : null;

            // Adicionar critérios se existirem
            const criterios = [
                { nome: 'Pontualidade', nota: r.pontualidade },
                { nome: 'Assiduidade', nota: r.assiduidade },
                { nome: 'Adaptação', nota: r.adaptacao },
                { nome: 'Relação com Colegas', nota: r.relacao_colegas },
                { nome: 'Organização', nota: r.organizacao },
                { nome: 'Ética Profissional', nota: r.etica_profissional },
                { nome: 'Iniciativa', nota: r.iniciativa },
                { nome: 'Cumprimento de Prazos', nota: r.cumprimento_prazos }
            ];

            // Adicionar critérios técnicos se não forem nulos/zero
            if (r.processo_ensino > 0) criterios.push({ nome: 'Processo Ensino', nota: r.processo_ensino });
            if (r.aperfeicoamento > 0) criterios.push({ nome: 'Aperfeiçoamento', nota: r.aperfeicoamento });
            if (r.inovacao > 0) criterios.push({ nome: 'Inovação', nota: r.inovacao });
            if (r.responsabilidade > 0) criterios.push({ nome: 'Responsabilidade', nota: r.responsabilidade });
            if (r.relacao_humanas > 0) criterios.push({ nome: 'Relações Humanas', nota: r.relacao_humanas });
            if (r.actividades_extras > 0) criterios.push({ nome: 'Actividades Extras', nota: r.actividades_extras });

            return {
                id: r.id_historico,
                funcionario: r.funcionario,
                evento: r.evento,
                data: r.data_hora,
                avaliador: r.avaliador_nome || 'Admin',
                criterios: criterios.filter(c => c.nota !== null),
                feedback,
                ...extra,
                id_nota: r.id_nota // Garante que não seja sobrescrito pelo extra
            };
        });

        console.log('SENDING_EVALS_COUNT:', formatted.length);
        if (formatted.length > 0) console.log('FIRST_EVAL_ID_NOTA:', formatted[0].id_nota);
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suas avaliações' });
    }
};

// --- NOVAS FUNÇÕES DE FEEDBACK E NOTIFICAÇÕES ---

exports.submitFeedback = async (req, res) => {
    const { id_nota, satisfacao, motivo } = req.body;
    const { id, role } = req.user;
    if (!id_nota) return res.status(400).json({ error: 'ID da avaliação é obrigatório' });

    try {
        // 1. Inserir ou Atualizar status na feedback_avaliacoes
        await db.query(
            `INSERT INTO feedback_avaliacoes (id_nota, satisfacao, motivo) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE satisfacao = VALUES(satisfacao), lida_funcionario = 0`,
            [id_nota, satisfacao ? 1 : 0, motivo || null]
        );

        // 2. Inserir mensagem na feedback_mensagens se houver motivo ou insatisfação
        if (motivo && motivo.trim() !== '') {
            await db.query(
                `INSERT INTO feedback_mensagens (id_nota, remetente_id, tipo_remetente, mensagem) VALUES (?, ?, 'funcionario', ?)`,
                [id_nota, id, motivo.trim()]
            );
        }

        if (!satisfacao) {
                // Fetch id_avaliador to target notification
                const [notaRows] = await db.query('SELECT id_avaliador FROM nota WHERE id_nota = ?', [id_nota]);
                const id_avaliador = notaRows[0]?.id_avaliador;

                // Busca nome do funcionario
                const [userRows] = await db.query('SELECT id_funcionario FROM usuario_perfil WHERE id_cadastro_usuario = ?', [id]);
                let funcName = 'Um funcionário';
                if (userRows.length > 0) {
                    const [fRows] = await db.query('SELECT nome_completo FROM funcionario WHERE id_funcionario = ?', [userRows[0].id_funcionario]);
                    funcName = fRows[0]?.nome_completo || funcName;
                }

                // Target the notification specifically to the admin who evaluated
                if (id_avaliador) {
                    await db.query(
                        `INSERT INTO notifications (message, type, admin_id, is_global, link, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
                        [`${funcName} expressou insatisfação na avaliação.`, 'feedback', id_avaliador, 0, '/relatorios', id_nota]
                    );
                }
        }
        res.json({ message: 'Feedback enviado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar feedback' });
    }
};

exports.replyFeedback = async (req, res) => {
    const { id_nota, resposta } = req.body;
    const { id } = req.user;
    try {
        // 1. Atualizar status na feedback_avaliacoes
        await db.query(
            `UPDATE feedback_avaliacoes SET resposta_admin = ?, respondido_em = CURRENT_TIMESTAMP, lida_funcionario = 0 WHERE id_nota = ?`,
            [resposta, id_nota]
        );

        // 2. Inserir na feedback_mensagens
        await db.query(
            `INSERT INTO feedback_mensagens (id_nota, remetente_id, tipo_remetente, mensagem) VALUES (?, ?, ?, ?)`,
            [id_nota, id, 'admin', resposta]
        );

        // 3. Notificar o Funcionário
        const [funcionario] = await db.query(`
            SELECT cp.id_cadastro_usuario
            FROM nota n
            JOIN usuario_perfil cp ON n.id_funcionario = cp.id_funcionario
            WHERE n.id_nota = ?
        `, [id_nota]);

        if (funcionario[0]?.id_cadastro_usuario) {
            await db.query(
                `INSERT INTO notifications (user_id, message, type, is_global, link_id) VALUES (?, ?, 'reply', 0, ?)`,
                [funcionario[0].id_cadastro_usuario, 'O administrador respondeu ao nosso diálogo sobre sua avaliação.', id_nota]
            );
        }

        res.json({ message: 'Resposta enviada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar resposta' });
    }
};

exports.getFeedbackThread = async (req, res) => {
    const { id_nota } = req.params;
    try {
        const [messages] = await db.query(
            `SELECT * FROM feedback_mensagens WHERE id_nota = ? ORDER BY criado_em ASC`,
            [id_nota]
        );
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
};

exports.addMessage = async (req, res) => {
    const { id_nota, mensagem } = req.body;
    const { id: userId, role } = req.user;
    const isEmployee = !(role === 'admin' || role === 'global_admin');
    const tipo = isEmployee ? 'funcionario' : 'admin';

    try {
        await db.query(
            `INSERT INTO feedback_mensagens (id_nota, remetente_id, tipo_remetente, mensagem) VALUES (?, ?, ?, ?)`,
            [id_nota, userId, tipo, mensagem]
        );

        // Notify the other party
        if (isEmployee) {
            const [notaRows] = await db.query('SELECT id_avaliador FROM nota WHERE id_nota = ?', [id_nota]);
            const id_avaliador = notaRows[0]?.id_avaliador;
            if (id_avaliador) {
                await db.query(
                    `INSERT INTO notifications (message, type, admin_id, is_global, link, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
                    [`Nova mensagem no histórico de feedback.`, 'feedback', id_avaliador, 0, '/relatorios', id_nota]
                );
            }
        } else {
            // It's from admin, notify employee
            const [nota] = await db.query(`
                SELECT n.id_funcionario, up.id_cadastro_usuario
                FROM nota n
                JOIN usuario_perfil up ON n.id_funcionario = up.id_funcionario
                WHERE n.id_nota = ?`, [id_nota]);

            if (nota[0]?.id_cadastro_usuario) {
                await db.query(
                    `INSERT INTO notifications (message, type, user_id, is_global, link, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
                    [`Nova resposta do Administrador na sua avaliação.`, 'reply', nota[0].id_cadastro_usuario, 0, '/minhas-avaliacoes', id_nota]
                );
            }
        }

        res.json({ message: 'Mensagem enviada' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { id, role } = req.user;
        const isAdmin = role === 'admin' || role === 'global_admin';

        let query = `SELECT * FROM notifications WHERE (user_id = ? OR admin_id = ?)`;
        let params = [id, id];

        if (isAdmin) {
            query += ` OR is_global = 1`;
        }

        query += ` ORDER BY created_at DESC LIMIT 20`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
};
