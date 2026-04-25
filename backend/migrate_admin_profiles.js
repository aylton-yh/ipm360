const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function fixAdminProfiles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Verificando perfil do Global Admin...');
        const [rows] = await connection.query('SELECT * FROM admin_perfil WHERE id_cadastro_admin = 1');

        if (rows.length === 0) {
            console.log('Perfil não encontrado para o ID 1. Criando...');
            await connection.query(
                `INSERT INTO admin_perfil (id_cadastro_admin, nome_completo, sexo, estado_civil, sobre) 
                 VALUES (1, 'Aylton Dinis', 'Masculino', 'Casado(a)', 'Administrador Global do Sistema IPM360')`
            );
            console.log('Perfil criado com sucesso.');
        } else {
            console.log('Perfil do Global Admin já existe.');
        }

        // Também garantir que o Helder Mateus (ID 2) está ok
        const [helder] = await connection.query('SELECT * FROM admin_perfil WHERE id_cadastro_admin = 2');
        if (helder.length === 0) {
            console.log('Criando perfil para o Helder Mateus (ID 2)...');
            await connection.query(
                `INSERT INTO admin_perfil (id_cadastro_admin, nome_completo, id_funcionario) 
                 VALUES (2, 'Helder Mateus', 7)`
            );
        }

    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await connection.end();
    }
}

fixAdminProfiles();
