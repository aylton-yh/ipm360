const express = require('express');
const router = express.Router();
const departamentoController = require('../controllers/departamento.controller');

router.get('/', departamentoController.getAllDepartamentos);
router.post('/', departamentoController.createDepartamento);
router.put('/:id', departamentoController.updateDepartamento);
router.delete('/:id', departamentoController.deleteDepartamento);

module.exports = router;
