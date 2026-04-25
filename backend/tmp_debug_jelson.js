const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function debug() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('--- BUSCANDO JELSON ---');
    const [funcs] = await connection.query("SELECT * FROM funcionario WHERE nome_completo LIKE '%Jelson%'");
    console.log('Funcionarios:', funcs);

    const [users] = await connection.query("SELECT * FROM cadastro_usuario WHERE username LIKE '%jelson%' OR email LIKE '%jelson%'");
    console.log('Usuarios:', users);

    const [perfils] = await connection.query("SELECT * FROM usuario_perfil WHERE nome_completo LIKE '%Jelson%'");
    console.log('Perfis:', perfils);

    if (funcs.length > 0) {
        const id = funcs[0].id_funcionario;
        const [history] = await connection.query("SELECT * FROM historico WHERE id_funcionario = ?", [id]);
        console.log('Historico do Funcionario:', history);

        const [notas] = await connection.query("SELECT * FROM nota WHERE id_funcionario = ?", [id]);
        console.log('Notas do Funcionario:', notas);
    }

    await connection.end();
}

debug().catch(console.error);
