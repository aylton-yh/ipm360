const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.getMe);
router.put('/update-profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.put('/update-theme', authMiddleware, authController.updateTheme);
router.get('/admins', authMiddleware, authController.getAllAdmins);
router.get('/users', authMiddleware, authController.getAllUsers);
router.post('/promote-employee', authMiddleware, authController.promoteEmployeeToAdmin);
router.put('/admins/:id', authMiddleware, authController.updateAdmin);
router.delete('/admins/:id', authMiddleware, authController.deleteAdmin);
router.put('/users/:id', authMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

module.exports = router;
