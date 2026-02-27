const db = require('../config/db');

// Obter histórico de mensagens
exports.getHistory = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                id,
                sender_id as senderId,
                sender_name as senderName,
                sender_role as senderRole,
                sender_photo as senderPhoto,
                tipo_mensagem as type,
                conteudo as content,
                metadata,
                status,
                criado_em as timestamp
            FROM chat_message
            ORDER BY criado_em ASC
            LIMIT 100
        `);

        // Parse JSON metadata
        const formatted = rows.map(r => ({
            ...r,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {})
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Erro ao buscar histórico do chat:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico', detail: error.message });
    }
};

// Persistir mensagem (usado internamente pelo WebSocket handler)
exports.saveMessage = async (msg) => {
    try {
        const [result] = await db.query(
            `INSERT INTO chat_message (sender_name, sender_role, sender_photo, tipo_mensagem, conteudo, metadata, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                msg.sender_name,
                msg.sender_role,
                msg.sender_photo || null,
                msg.type || 'text',
                msg.content,
                JSON.stringify(msg.metadata || {}),
                'delivered'
            ]
        );
        return result.insertId;
    } catch (error) {
        console.error('Erro ao salvar mensagem no banco:', error);
        return null;
    }
};
