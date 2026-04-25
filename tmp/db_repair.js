const mysql = require('../backend/node_modules/mysql2/promise');
const dotenv = require('../backend/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function repair() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ipm360',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Achar usuários em cadastro_admin com role='funcionario'
        const [rows] = await connection.query("SELECT * FROM cadastro_admin WHERE role = 'funcionario'");
        console.log(`Encontrados ${rows.length} usuários para migrar.`);

        for (const admin of rows) {
            console.log(`Migrando ${admin.username}...`);
            
            // Pegar perfil
            const [perfilRows] = await connection.query('SELECT * FROM admin_perfil WHERE id_cadastro_admin = ?', [admin.id_cadastro_admin]);
            const perfil = perfilRows[0];

            // Inserir em cadastro_usuario (se não existir)
            const [userExists] = await connection.query('SELECT id_cadastro_usuario FROM cadastro_usuario WHERE email = ?', [admin.email]);
            
            let userId;
            if (userExists.length === 0) {
                const [newUser] = await connection.query(
                    'INSERT INTO cadastro_usuario (username, email, senha_hash, role, status, theme) VALUES (?, ?, ?, ?, ?, ?)',
                    [admin.username, admin.email, admin.senha_hash, admin.role, admin.status, admin.theme]
                );
                userId = newUser.insertId;

                if (perfil) {
                    await connection.query(
                        `INSERT INTO usuario_perfil (
                            id_cadastro_usuario, nome_completo, id_funcionario, email, bi, foto, 
                            telefone, endereco, sobre, sexo, estado_civil, departamento, cargo
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            userId, perfil.nome_completo, perfil.id_funcionario, admin.email, perfil.bi, perfil.foto,
                            perfil.telefone, perfil.endereco, perfil.sobre, perfil.sexo, perfil.estado_civil,
                            perfil.departamento, perfil.cargo
                        ]
                    );
                }
            } else {
                console.log(`Usuário ${admin.email} já existe na cadastro_usuario. Pulando insert.`);
            }

            // Deletar da cadastro_admin
            await connection.query('DELETE FROM admin_perfil WHERE id_cadastro_admin = ?', [admin.id_cadastro_admin]);
            await connection.query('DELETE FROM notifications WHERE admin_id = ?', [admin.id_cadastro_admin]);
            await connection.query('DELETE FROM cadastro_admin WHERE id_cadastro_admin = ?', [admin.id_cadastro_admin]);
        }

        await connection.commit();
        console.log('Reparo concluído com sucesso.');

    } catch (e) {
        if (connection) await connection.rollback();
        console.error('Error:', e.message);
    } finally {
        connection.release();
        await pool.end();
    }
}

repair();
