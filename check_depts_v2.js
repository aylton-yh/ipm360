const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        const [depts] = await pool.query('SELECT * FROM departamento');
        console.log('Departamentos:', depts);

        const [emps] = await pool.query(`
            SELECT f.nome_completo, d.nome_departamento 
            FROM funcionario f 
            LEFT JOIN cargo c ON f.id_cargo = c.id_seccao_cargo
            LEFT JOIN seccao s ON c.id_seccao_cargo = s.id_seccao 
            LEFT JOIN departamento d ON s.id_departamento = d.id_departamento
        `);
        console.log('Funcionários e seus Departamentos:', emps);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
