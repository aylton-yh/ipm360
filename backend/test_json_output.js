const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function test() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD
    });

    const [rows] = await connection.query(`
             SELECT h.*, f.nome_completo as funcionario, n.id_nota,
                    n.pontualidade, n.assiduidade, n.adaptacao, n.relacao_colegas, n.organizacao,
                    n.etica_profissional, n.iniciativa, n.cumprimento_prazos,
                    n.processo_ensino, n.aperfeicoamento, n.inovacao, n.responsabilidade,
                    n.relacao_humanas, n.actividades_extras, n.faltas, n.periodo,
                    fa.satisfacao, fa.motivo, fa.resposta_admin, fa.respondido_em
             FROM historico h
             JOIN funcionario f ON h.id_funcionario = f.id_funcionario
             LEFT JOIN resultado res ON h.id_resultado = res.id_resultado
             LEFT JOIN nota n ON res.id_nota = n.id_nota
             LEFT JOIN feedback_avaliacoes fa ON n.id_nota = fa.id_nota
             WHERE h.id_funcionario = 8 AND h.evento = 'avaliacao'
             ORDER BY h.data_hora DESC
    `);

    const formatted = rows.map(r => {
        const extra = typeof r.dados_novos === 'string' ? JSON.parse(r.dados_novos) : r.dados_novos;
        const feedback = (r.satisfacao !== null && r.satisfacao !== undefined) ? {
            satisfacao: r.satisfacao,
            motivo: r.motivo,
            resposta_admin: r.resposta_admin,
            respondido_em: r.respondido_em
        } : null;

        const criterios = []; // simplified for test

        return {
            id: r.id_historico,
            id_nota: r.id_nota,
            funcionario: r.funcionario,
            evento: r.evento,
            data: r.data_hora,
            criterios: criterios,
            feedback,
            ...extra
        };
    });

    console.log('JSON RESULT:', JSON.stringify(formatted, null, 2));
    await connection.end();
}

test();
