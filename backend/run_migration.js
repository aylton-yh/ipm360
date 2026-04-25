const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'IPM360',
        multipleStatements: true
    });

    try {
        const sqlPath = path.join(__dirname, 'scripts', 'add_missing_profile_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await connection.query(sql);
        console.log('Migração concluída com sucesso!');
    } catch (error) {
        console.error('Erro na migração:', error);
    } finally {
        await connection.end();
    }
}

migrate();
