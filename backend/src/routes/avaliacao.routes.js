const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacao.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/submit', authMiddleware, avaliacaoController.submitAvaliacao);
router.get('/history', authMiddleware, avaliacaoController.getAvaliacaoHistory);
router.get('/my-evaluations', authMiddleware, avaliacaoController.getMyEvaluations);
router.get('/my-stats', authMiddleware, avaliacaoController.getMyStats);
router.post('/feedback', authMiddleware, avaliacaoController.submitFeedback);
router.post('/reply-feedback', authMiddleware, avaliacaoController.replyFeedback);
router.get('/feedback/thread/:id_nota', authMiddleware, avaliacaoController.getFeedbackThread);
router.post('/feedback/message', authMiddleware, avaliacaoController.addMessage);
router.get('/notifications', authMiddleware, avaliacaoController.getNotifications);
router.delete('/history/clear', authMiddleware, avaliacaoController.deleteHistory);
router.delete('/history/:id', authMiddleware, avaliacaoController.deleteHistoryItem);

module.exports = router;
