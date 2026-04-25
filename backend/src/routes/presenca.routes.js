const express = require('express');
const router = express.Router();
const presencaController = require('../controllers/presenca.controller');

router.post('/', presencaController.marcarPresenca);
router.get('/hoje', presencaController.getPresencaHoje);
router.get('/historico/:id_funcionario', presencaController.getHistoricoFuncionario);

module.exports = router;
