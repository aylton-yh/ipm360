const mysql = require('../backend/node_modules/mysql2/promise');
const dotenv = require('../backend/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ipm360',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('--- CADASTRO_ADMIN ---');
        const [admins] = await pool.query('SELECT id_cadastro_admin, username, email, role, status FROM cadastro_admin');
        console.table(admins);

        console.log('\n--- CADASTRO_USUARIO ---');
        const [users] = await pool.query('SELECT id_cadastro_usuario, username, email, role, status FROM cadastro_usuario');
        console.table(users);

        console.log('\n--- FUNCIONARIO ---');
        const [emps] = await pool.query('SELECT id_funcionario, nome_completo, email FROM funcionario LIMIT 10');
        console.table(emps);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
