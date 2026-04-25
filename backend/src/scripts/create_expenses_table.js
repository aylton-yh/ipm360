const db = require('../config/db');

async function createExpensesTable() {
    try {
        console.log('Criando tabela de despesas...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS expense (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_funcionario INT,
                categoria VARCHAR(100),
                descricao TEXT,
                valor DECIMAL(15, 2),
                data DATE,
                status ENUM('Pendente', 'Aprovado', 'Rejeitado', 'Pago') DEFAULT 'Pendente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_expense_funcionario FOREIGN KEY (id_funcionario)
                    REFERENCES funcionario(id_funcionario) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Tabela expense criada com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar tabela expense:', error);
        process.exit(1);
    }
}

createExpensesTable();
