require('dotenv').config({ path: 'c:/Users/hp/Downloads/ipm360/backend/.env' });
const db = require('c:/Users/hp/Downloads/ipm360/backend/src/config/db');

async function checkDuplicates() {
    try {
        const [admins] = await db.query('SELECT id_cadastro_admin as id, username, email FROM cadastro_admin');
        const [users] = await db.query('SELECT id_cadastro_usuario as id, username, email FROM cadastro_usuario');
        
        console.log('--- ADMINS ---');
        console.table(admins);
        console.log('--- USERS ---');
        console.table(users);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkDuplicates();
