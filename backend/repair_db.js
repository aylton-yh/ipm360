const db = require('./src/config/db');

async function repair() {
    try {
        console.log("Iniciando reparação de vínculos de departamentos e cargos...");

        // 1. Restaurar id_cargo baseado nos nomes salvos nos perfis (usuários comuns)
        const [resUser] = await db.query(`
            UPDATE funcionario f
            JOIN usuario_perfil up ON f.id_funcionario = up.id_funcionario
            JOIN seccao s ON up.cargo = s.nome_seccao
            JOIN departamento d ON s.id_departamento = d.id_departamento AND up.departamento = d.nome_departamento
            SET f.id_cargo = s.id_seccao
            WHERE f.id_cargo NOT IN (SELECT id_seccao FROM seccao) OR f.id_cargo IS NULL;
        `);
        console.log(`Reparados ${resUser.affectedRows} vínculos via perfis de usuário.`);

        // 2. Restaurar id_cargo baseado nos nomes salvos nos perfis (administradores)
        const [resAdmin] = await db.query(`
            UPDATE funcionario f
            JOIN admin_perfil ap ON f.id_funcionario = ap.id_funcionario
            JOIN seccao s ON ap.cargo = s.nome_seccao
            JOIN departamento d ON s.id_departamento = d.id_departamento AND ap.departamento = d.nome_departamento
            SET f.id_cargo = s.id_seccao
            WHERE f.id_cargo NOT IN (SELECT id_seccao FROM seccao) OR f.id_cargo IS NULL;
        `);
        console.log(`Reparados ${resAdmin.affectedRows} vínculos via perfis de administrador.`);

        console.log("Reparação concluída com sucesso!");
    } catch (e) {
        console.error("Erro durante a reparação:", e);
    } finally {
        process.exit();
    }
}

repair();
