const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/hp/Downloads/ipm360/backend/.env' });

async function checkNotifications() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        console.log('Verificando tabela notifications...');
        const [rows] = await connection.query('DESCRIBE notifications');
        console.log('COLUMNS:');
        rows.forEach(c => console.log(`- ${c.Field} (${c.Type})`));
    } catch (error) {
        console.error('Erro:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('A tabela notifications NÃO EXISTE.');
        }
    } finally {
        await connection.end();
    }
}

checkNotifications();
