const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log('--- INICIANDO MIGRAÇÃO DE CORREÇÃO ---');

        // 1. Adicionar id_avaliador à tabela nota
        try {
            await connection.query("ALTER TABLE nota ADD COLUMN id_avaliador INT AFTER id_seccao_cargo");
            console.log('Coluna id_avaliador adicionada a nota.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('Coluna id_avaliador já existe em nota.');
            else throw e;
        }

        // 2. Adicionar link_id à tabela notifications
        try {
            await connection.query("ALTER TABLE notifications ADD COLUMN link_id INT AFTER link");
            console.log('Coluna link_id adicionada a notifications.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('Coluna link_id já existe em notifications.');
            else throw e;
        }

        // 3. Criar tabela feedback_avaliacoes
        const createFeedbackTable = `
            CREATE TABLE IF NOT EXISTS feedback_avaliacoes (
                id_feedback INT AUTO_INCREMENT PRIMARY KEY,
                id_nota INT NOT NULL,
                satisfacao BOOLEAN NOT NULL,
                motivo TEXT,
                resposta_admin TEXT,
                respondido_em TIMESTAMP NULL,
                lida_funcionario BOOLEAN DEFAULT FALSE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_feedback_nota FOREIGN KEY (id_nota) REFERENCES nota(id_nota) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await connection.query(createFeedbackTable);
        console.log('Tabela feedback_avaliacoes verificada/criada.');

        console.log('--- MIGRAÇÃO CONCLUÍDA COM SUCESSO ---');
        process.exit(0);
    } catch (error) {
        console.error('ERRO NA MIGRAÇÃO:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
