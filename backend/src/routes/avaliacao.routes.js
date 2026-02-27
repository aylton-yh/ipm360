const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacao.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/submit', authMiddleware, avaliacaoController.submitAvaliacao);
router.get('/history', authMiddleware, avaliacaoController.getAvaliacaoHistory);

module.exports = router;
