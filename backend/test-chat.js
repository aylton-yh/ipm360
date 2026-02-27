require('dotenv').config();
const db = require('./src/config/db');

async function testQuery() {
    try {
        console.log('Testando query de histórico de chat...');
        const [rows] = await db.query(`
            SELECT 
                id,
                sender_id as senderId,
                sender_name as senderName,
                sender_role as senderRole,
                sender_photo as senderPhoto,
                tipo_mensagem as type,
                conteudo as content,
                metadata,
                status,
                criado_em as timestamp
            FROM chat_message
            ORDER BY criado_em ASC
            LIMIT 100
        `);
        console.log('Query executada com sucesso. Total de linhas:', rows.length);
        if (rows.length > 0) {
            console.log('Exemplo de linha:', rows[0]);
        }
        process.exit(0);
    } catch (error) {
        console.error('ERRO NA QUERY:', error);
        process.exit(1);
    }
}

testQuery();
