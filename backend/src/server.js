const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const authMiddleware = require('./middleware/auth.middleware');

app.use('/auth', authRoutes);
app.use('/api/funcionarios', authMiddleware, funcionarioRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do IPM360' });
});

// Port configuration
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
