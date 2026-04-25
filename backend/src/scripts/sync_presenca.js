const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function sync() {
    try {
        console.log('Lendo arquivo de migração presenca_table.sql...');
        const sqlPath = path.join(__dirname, '../../../database/migrations/presenca_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Remover a linha 'USE IPM360;' se existir, pois já estamos conectados ao banco correto
        const cleanSql = sql.replace(/USE IPM360;/gi, '');

        console.log('Executando migração...');
        await db.query(cleanSql);

        console.log('Sincronização concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro na sincronização:', error);
        process.exit(1);
    }
}

sync();
