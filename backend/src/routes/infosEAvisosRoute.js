const express = require('express');
const router = express.Router();
const { criarInformacao, editarInformacao, eliminarInformacao, listarInformacoes } = require('../controllers/infosEAvisosController');

router.post('/create', criarInformacao);
router.put('/update/:id', editarInformacao);
router.delete('/delete/:id', eliminarInformacao);
router.get('/list', listarInformacoes);

module.exports = router;
