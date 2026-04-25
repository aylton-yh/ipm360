const db = require('../config/db');

const countUsers = async () => {
    try {
        const [adminRows] = await db.query('SELECT COUNT(*) as count FROM cadastro_admin');
        const [userRows] = await db.query('SELECT COUNT(*) as count FROM cadastro_usuario');

        console.log(`Admins: ${adminRows[0].count}`);
        console.log(`Users: ${userRows[0].count}`);
        process.exit(0);
    } catch (error) {
        console.error('Error counting users:', error);
        process.exit(1);
    }
};

countUsers();
