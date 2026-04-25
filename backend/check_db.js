const db = require('./src/config/db');

async function checkIntegrity() {
    try {
        console.log("Checking for broken id_cargo references...");
        const [broken] = await db.query(`
            SELECT id_funcionario, nome_completo, id_cargo 
            FROM funcionario 
            WHERE id_cargo IS NOT NULL 
            AND id_cargo NOT IN (SELECT id_seccao FROM seccao);
        `);
        console.log(`Found ${broken.length} employees with broken cargo links.`);
        if (broken.length > 0) {
            console.table(broken);
        }

        console.log("\nChecking profile strings...");
        const [profiles] = await db.query(`
            SELECT id_funcionario, nome_completo, departamento, cargo 
            FROM usuario_perfil;
        `);
        console.table(profiles);

        console.log("\nChecking available sections (seccao)...");
        const [sections] = await db.query(`
            SELECT s.id_seccao, s.nome_seccao, d.nome_departamento 
            FROM seccao s
            JOIN departamento d ON s.id_departamento = d.id_departamento;
        `);
        console.table(sections);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkIntegrity();
