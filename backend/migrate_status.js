const db = require('./src/config/db');

async function migrateStatus() {
    try {
        console.log('Normalizando dados existentes...');
        
        // 1. Normalizar variações para o novo padrão
        await db.query("UPDATE funcionario SET status_funcionario = 'Ativo' WHERE status_funcionario = 'Activo'");
        await db.query("UPDATE funcionario SET status_funcionario = 'Inativo' WHERE status_funcionario = 'Inactivo'");
        await db.query("UPDATE funcionario SET status_funcionario = 'Férias' WHERE status_funcionario = 'Ferias'");
        
        console.log('Alterando a definição da coluna para o novo ENUM padrão...');
        
        // 2. Redefinir a coluna ENUM
        await db.query("ALTER TABLE funcionario MODIFY COLUMN status_funcionario ENUM('Ativo', 'Inativo', 'Férias', 'Suspenso') DEFAULT 'Ativo'");
        
        console.log('Migração concluída com sucesso!');
        
        // Verificar resultados
        const [rows] = await db.query('SELECT status_funcionario, COUNT(*) as count FROM funcionario GROUP BY status_funcionario');
        console.log('Estado atual dos funcionários:');
        console.table(rows);
        
    } catch (error) {
        console.error('Erro na migração:', error);
    } finally {
        process.exit();
    }
}

migrateStatus();
