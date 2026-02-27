const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/history', authMiddleware, chatController.getHistory);

module.exports = router;
