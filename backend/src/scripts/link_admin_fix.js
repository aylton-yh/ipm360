const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function linkAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        console.log('--- Iniciando fix de vínculo do Admin ---');

        // 1. Verificar se Aylton Dinis já existe na tabela funcionario
        const [funcRows] = await connection.query('SELECT id_funcionario FROM funcionario WHERE nome_completo = "Aylton Dinis"');
        let funcionarioId;

        if (funcRows.length === 0) {
            console.log('Aylton não encontrado em funcionario. Criando registro...');
            // Pegar o email do cadastro_admin para manter consistência
            const [adminData] = await connection.query('SELECT email FROM cadastro_admin WHERE username = "Aylton Dinis" OR id_cadastro_admin = 1');
            const email = adminData[0]?.email || 'aylton.dinis@ipm360.ao';

            const [result] = await connection.query(
                `INSERT INTO funcionario (nome_completo, email, status_funcionario, genero, estado_civil, criado_em) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                ['Aylton Dinis', email, 'Ativo', 'Masculino', 'Casado(a)']
            );
            funcionarioId = result.insertId;
            console.log(`Registro criado em funcionario com ID: ${funcionarioId}`);
        } else {
            funcionarioId = funcRows[0].id_funcionario;
            console.log(`Aylton já possui registro em funcionario com ID: ${funcionarioId}`);
        }

        // 2. Vincular no admin_perfil
        const [updateResult] = await connection.query(
            'UPDATE admin_perfil SET id_funcionario = ? WHERE id_cadastro_admin = 1 OR nome_completo = "Aylton Dinis"',
            [funcionarioId]
        );

        if (updateResult.affectedRows > 0) {
            console.log('admin_perfil atualizado com sucesso com id_funcionario.');
        } else {
            console.log('Aviso: Nenhum registro em admin_perfil foi atualizado. Verifique se o id_cadastro_admin = 1 ou nome_completo bate.');
        }

        console.log('--- Fix concluído com sucesso ---');

    } catch (error) {
        console.error('Erro ao vincular Admin:', error);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

linkAdmin();
