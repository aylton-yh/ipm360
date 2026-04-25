const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/roles', authMiddleware, systemController.getRoles);
router.get('/notifications', authMiddleware, systemController.getNotifications);
router.post('/notifications', authMiddleware, systemController.createNotification);
router.put('/notifications/:id/read', authMiddleware, systemController.markNotificationAsRead);

module.exports = router;
