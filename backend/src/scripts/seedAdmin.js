const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
    const username = 'Aylton Dinis';
    const email = 'aylton@ipm360.com';
    const password = '2004';
    const role = 'global_admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const checkAdmin = await db.query('SELECT * FROM cadastro_admin WHERE username = $1', [username]);

        if (checkAdmin.rows.length === 0) {
            await db.query(
                'INSERT INTO cadastro_admin (username, email, senha_hash, role, status) VALUES ($1, $2, $3, $4, $5)',
                [username, email, hashedPassword, role, 'approved']
            );
            console.log('Usuário Admin criado com sucesso!');
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('Usuário Admin já existe.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        process.exit(1);
    }
};

seedAdmin();
