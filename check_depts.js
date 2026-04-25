const db = require('./backend/src/config/db');

async function checkData() {
    try {
        const [depts] = await db.query('SELECT * FROM departamento');
        console.log('Departamentos:', depts);
        const [emps] = await db.query('SELECT f.nome_completo, d.nome_departamento FROM funcionario f LEFT JOIN seccao s ON f.id_cargo = s.id_seccao LEFT JOIN departamento d ON s.id_departamento = d.id_departamento');
        console.log('Funcionários e seus Departamentos:', emps);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
