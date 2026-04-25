const mysql = require('../backend/node_modules/mysql2/promise');
const dotenv = require('../backend/node_modules/dotenv');
const bcrypt = require('../backend/node_modules/bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function verifyPasswords() {
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
        console.log('--- VERIFICANDO SENHAS ---');
        
        // Helder (Admin)
        const [helderRows] = await pool.query('SELECT username, senha_hash FROM cadastro_admin WHERE username = "helder"');
        if (helderRows.length > 0) {
            const match = await bcrypt.compare('123456', helderRows[0].senha_hash);
            console.log(`Helder (admin): ${match ? 'SENHA CORRETA (123456)' : 'SENHA INCORRETA'}`);
        } else {
            console.log('Helder não encontrado em cadastro_admin');
        }

        // Jelson (Usuario)
        const [jelsonRows] = await pool.query('SELECT username, senha_hash FROM cadastro_usuario WHERE username = "jelson52"');
        if (jelsonRows.length > 0) {
            const match = await bcrypt.compare('123456', jelsonRows[0].senha_hash);
            console.log(`Jelson (usuario): ${match ? 'SENHA CORRETA (123456)' : 'SENHA INCORRETA'}`);
        } else {
            console.log('Jelson não encontrado em cadastro_usuario');
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

verifyPasswords();
