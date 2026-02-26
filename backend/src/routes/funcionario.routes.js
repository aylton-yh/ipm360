const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionario.controller');

router.get('/', funcionarioController.getAllFuncionarios);
router.post('/', funcionarioController.createFuncionario);
router.get('/:id', funcionarioController.getFuncionarioById);

module.exports = router;
