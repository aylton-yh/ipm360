const db = require('./src/config/db');

async function findJelsonCargo() {
    try {
        console.log("Pesquisando dados de Jelson Jorge em todo o histórico...");
        const [rows] = await db.query('SELECT * FROM historico WHERE id_funcionario = 8 ORDER BY id_historico ASC');
        
        for (const row of rows) {
            console.log(`Evento: ${row.evento}`);
            if (row.dados_novos) {
                try {
                    const data = JSON.parse(row.dados_novos);
                    if (data.cargo || data.dept) {
                        console.log("Achado dados novos:", data);
                    }
                } catch(e) {}
            }
            if (row.dados_anteriores) {
                try {
                    const data = JSON.parse(row.dados_anteriores);
                    if (data.cargo || data.dept) {
                        console.log("Achado dados anteriores:", data);
                    }
                } catch(e) {}
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

findJelsonCargo();
