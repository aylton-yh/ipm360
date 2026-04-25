const db = require('../config/db');

const fetchDetails = async () => {
    try {
        const [admins] = await db.query('SELECT id_cadastro_admin, username, email, role, status, criado_em FROM cadastro_admin');
        const [users] = await db.query('SELECT id_cadastro_usuario, username, email, role, status, criado_em FROM cadastro_usuario');

        console.log('--- ADMINS ---');
        console.log(JSON.stringify(admins, null, 2));
        console.log('\n--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error fetching details:', error);
        process.exit(1);
    }
};

fetchDetails();
