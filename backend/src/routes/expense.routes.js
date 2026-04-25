const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, expenseController.getAllExpenses);
router.post('/', authMiddleware, expenseController.createExpense);
router.put('/:id', authMiddleware, expenseController.updateExpense);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
