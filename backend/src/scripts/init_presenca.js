const db = require('../config/db');

async function init() {
    try {
        console.log('Iniciando criação da tabela presenca...');
        const sql = `
            CREATE TABLE IF NOT EXISTS presenca (
                id_presenca INT AUTO_INCREMENT PRIMARY KEY,
                id_funcionario INT,
                status ENUM('Presente', 'Faltou') NOT NULL,
                data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_presenca_funcionario_new FOREIGN KEY (id_funcionario)
                    REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(sql);
        console.log('Tabela presenca verificada/criada com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar tabela:', error);
        process.exit(1);
    }
}

init();
