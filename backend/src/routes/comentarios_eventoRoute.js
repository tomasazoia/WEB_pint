const express = require('express');
const router = express.Router();
const createComentario = require('../controllers/comentarios_eventoController');

router.post('/create', createComentario.addComentario);
router.get('/list', createComentario.listarComentarios);
router.get('/listevento/:idEvento', createComentario.listarComentariosPorEvento);
router.get('/listeventoinvalido', createComentario.listarComentariosPorEventoInv);
router.delete('/delete/:idComentario', createComentario.deleteComentario);
router.get('/area/:id', createComentario.listarComentariosPorArea);
router.put('/validar/:idComentario', createComentario.validarComentario);
router.put('/invalidar/:idComentario', createComentario.invalidarComentario);
router.get('/quantidade', createComentario.listarQuantidadeComentarios);
module.exports = router;
