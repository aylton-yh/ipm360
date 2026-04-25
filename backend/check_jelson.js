const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'ipm360',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    try {
        const [rows] = await connection.query("SELECT id_funcionario, nome_completo FROM funcionario WHERE nome_completo LIKE '%Jelson%'");
        console.log("Jelson's data:", JSON.stringify(rows));

        if (rows.length > 0) {
            const fid = rows[0].id_funcionario;

            const query = `
             SELECT h.*, f.nome_completo as funcionario,
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
             WHERE h.id_funcionario = ?
             ORDER BY h.data_hora DESC`;

            const [evals] = await connection.query(query, [fid]);
            console.log("Full Query Results for Jelson:", JSON.stringify(evals));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await connection.end();
    }
}
check();
