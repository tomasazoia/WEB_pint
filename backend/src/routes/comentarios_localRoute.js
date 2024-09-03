const express = require('express');
const router = express.Router();
const createComentario = require('../controllers/comentarios_localController');

router.post('/create', createComentario.addComentarioLocal);
router.get('/list', createComentario.listarComentariosLocal);
router.get('/listlocal/:idLocal', createComentario.listarComentariosPorLocal);
router.get('/listlocalinvalido', createComentario.listarComentariosPorLocalInv);
router.delete('/delete/:idComentario', createComentario.deleteComentarioLocal);
router.get('/area/:id', createComentario.listarComentariosPorAreaLocal);
router.put('/validar/:idComentario', createComentario.validarComentarioLocal);
router.put('/invalidar/:idComentario', createComentario.invalidarComentarioLocal);
router.get('/quantidade', createComentario.listarQuantidadeComentariosLocais);

module.exports = router;
