const db = require('./src/config/db');

async function repair() {
    try {
        console.log("Restaurando vínculos perdidos...");

        // Restaurar para usuários comuns
        const [resUser] = await db.query(`
            UPDATE funcionario f
            JOIN usuario_perfil up ON f.id_funcionario = up.id_funcionario
            JOIN seccao s ON up.cargo = s.nome_seccao
            JOIN departamento d ON s.id_departamento = d.id_departamento AND up.departamento = d.nome_departamento
            SET f.id_cargo = s.id_seccao
            WHERE f.id_cargo IS NULL;
        `);
        console.log(`Restaurados ${resUser.affectedRows} vínculos de usuários.`);

        // Restaurar para administradores
        const [resAdmin] = await db.query(`
            UPDATE funcionario f
            JOIN admin_perfil ap ON f.id_funcionario = ap.id_funcionario
            JOIN seccao s ON ap.cargo = s.nome_seccao
            JOIN departamento d ON s.id_departamento = d.id_departamento AND ap.departamento = d.nome_departamento
            SET f.id_cargo = s.id_seccao
            WHERE f.id_cargo IS NULL;
        `);
        console.log(`Restaurados ${resAdmin.affectedRows} vínculos de administradores.`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

repair();
