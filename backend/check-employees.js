const db = require('./src/config/db');
require('dotenv').config();

async function checkEmployees() {
    try {
        const [rows] = await db.query('SELECT * FROM funcionario');
        console.log('Total de funcionários na tabela:', rows.length);
        if (rows.length > 0) {
            console.log('Primeiro registro:', rows[0]);
        }
        
        const [joined] = await db.query(`
            SELECT f.id_funcionario, f.nome_completo, s.nome_seccao as cargo_nome, d.nome_departamento as dept_nome
            FROM funcionario f
            LEFT JOIN seccao s ON f.id_cargo = s.id_seccao
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
        `);
        console.log('Total com JOIN ATUAL:', joined.length);

        const [correctJoined] = await db.query(`
            SELECT f.id_funcionario, f.nome_completo, c.nome_seccao_cargo as cargo_nome
            FROM funcionario f
            LEFT JOIN cargo c ON f.id_cargo = c.id_seccao_cargo
        `);
        console.log('Total com JOIN CARGO (Correto conforme Schema):', correctJoined.length);

    } catch (error) {
        console.error('ERRO AO VERIFICAR FUNCIONÁRIOS:', error);
    } finally {
        process.exit();
    }
}

checkEmployees();
