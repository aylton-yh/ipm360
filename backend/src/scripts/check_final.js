const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '2004',
    port: 5433,
});

async function checkTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found in postgres:', res.rows.map(r => r.table_name).join(', '));

        if (res.rows.some(r => r.table_name === 'cadastro_admin')) {
            const adminCount = await pool.query('SELECT COUNT(*) FROM cadastro_admin');
            const userCount = await pool.query('SELECT COUNT(*) FROM cadastro_usuario');
            console.log(`Admins: ${adminCount.rows[0].count}`);
            console.log(`Users: ${userCount.rows[0].count}`);
        } else {
            console.log('User tables not found in postgres database.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkTables();
