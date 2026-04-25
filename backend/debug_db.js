const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkProfiles() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'ipm360',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- USUARIO_PERFIL ---');
        const [profiles] = await pool.query("SELECT id_cadastro_usuario, nome_completo, departamento FROM usuario_perfil");
        console.table(profiles);

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkProfiles();
