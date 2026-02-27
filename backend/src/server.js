const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const http = require('http');
const { WebSocketServer } = require('ws');

// Routes
const authRoutes = require('./routes/auth.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const departamentoRoutes = require('./routes/departamento.routes');
const avaliacaoRoutes = require('./routes/avaliacao.routes');
const chatRoutes = require('./routes/chat.routes');
const authMiddleware = require('./middleware/auth.middleware');
const chatController = require('./controllers/chat.controller');

app.use('/auth', authRoutes);
app.use('/api/funcionarios', authMiddleware, funcionarioRoutes);
app.use('/api/departments', authMiddleware, departamentoRoutes);
app.use('/api/evaluations', authMiddleware, avaliacaoRoutes);
app.use('/api/chat', chatRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do IPM360' });
});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// WebSocket Setup
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);

    if (pathname.startsWith('/ws/chat/')) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

wss.on('connection', (ws) => {
    console.log('Cliente conectado ao WebSocket');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            // Salvar no banco
            const messageId = await chatController.saveMessage(data);
            
            if (messageId) {
                const broadcastData = JSON.stringify({
                    id: messageId,
                    senderId: data.sender_id || null,
                    senderName: data.sender_name,
                    senderRole: data.sender_role,
                    senderPhoto: data.sender_photo,
                    type: data.type,
                    content: data.content,
                    metadata: data.metadata || {},
                    timestamp: new Date().toISOString()
                });

                // Broadcast para todos os clientes conectados
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) { // OPEN
                        client.send(broadcastData);
                    }
                });
            }
        } catch (e) {
            console.error('Erro no processamento da mensagem WebSocket:', e);
        }
    });

    ws.on('close', () => console.log('Cliente desconectado'));
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
