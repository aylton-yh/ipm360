const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function checkAdmins() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('--- CADASTRO_ADMIN ---');
        const [admins] = await connection.query('SELECT id_cadastro_admin as id, username, email, role FROM cadastro_admin');
        console.table(admins);

        console.log('\n--- ADMIN_PERFIL ---');
        // Let's see all columns in admin_perfil
        const [perfilCols] = await connection.query('SHOW COLUMNS FROM admin_perfil');
        console.log('Colunas:', perfilCols.map(c => c.Field).join(', '));

        const [perfis] = await connection.query('SELECT * FROM admin_perfil');
        console.table(perfis);

        console.log('\n--- FUNCIONARIOS LINKED TO ADMINS ---');
        const [funcs] = await connection.query(`
            SELECT f.id_funcionario, f.nome_completo, f.img_path, ap.id_cadastro_admin
            FROM funcionario f
            JOIN admin_perfil ap ON f.id_funcionario = ap.id_funcionario
        `);
        console.table(funcs);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkAdmins();
