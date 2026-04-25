const db = require('../config/db');

// In a real scenario, these would be in the database. 
// For now, we'll implement the logic to fetch/save them to DB tables if they exist, 
// or use a structured approach.

exports.getRoles = async (req, res) => {
    try {
        // Checking if 'roles' table exists or returning default if not
        // (For this task, we assume the user wants them persistent)
        // Let's create a table for it if it doesn't exist? No, let's just query.
        const [rows] = await db.query('SELECT * FROM roles');
        res.json(rows);
    } catch (error) {
        // If table doesn't exist, we'll return the defaults from the plan
        res.json([]);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'global_admin';
        const query = isAdmin
            ? 'SELECT id, message, type, is_read as `read`, created_at as date, link, link_id FROM notifications WHERE user_id = ? OR is_global = 1 ORDER BY created_at DESC'
            : 'SELECT id, message, type, is_read as `read`, created_at as date, link, link_id FROM notifications WHERE user_id = ? ORDER BY created_at DESC';

        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.json([]);
    }
};

exports.createNotification = async (req, res) => {
    const { message, type, user_id, is_global, link } = req.body;
    try {
        await db.query(
            'INSERT INTO notifications (message, type, user_id, is_global, link) VALUES (?, ?, ?, ?, ?)',
            [message, type, user_id, is_global ? 1 : 0, link || null]
        );
        res.status(201).json({ message: 'Notificação criada' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar notificação' });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        res.json({ message: 'Notificação marcada como lida' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }
};
