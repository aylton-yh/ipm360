const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        const [resCount] = await conn.query('SELECT COUNT(*) as count FROM resultado');
        const [histCount] = await conn.query('SELECT COUNT(*) as count FROM historico');
        const [histEvalCount] = await conn.query('SELECT COUNT(*) as count FROM historico WHERE tipo = "avaliacao" OR acao LIKE "%avaliou%"');
        const [notaSeleniumCount] = await conn.query('SELECT COUNT(*) as count FROM nota');

        console.log({
            resultado_total: resCount[0].count,
            historico_total: histCount[0].count,
            historico_evals: histEvalCount[0].count,
            nota_total: notaSeleniumCount[0].count
        });

        const [results] = await conn.query('SELECT * FROM resultado');
        console.log('Results Sample:', results);

    } catch (e) {
        console.error(e);
    } finally {
        await conn.end();
        process.exit(0);
    }
})();
