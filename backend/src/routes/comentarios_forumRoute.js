const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarios_forumController');


router.get('/list', comentarioController.comentario_list);
router.get('/get/:id', comentarioController.comentario_detail);
router.post('/create', comentarioController.comentario_create);
router.put('/update/:id', comentarioController.comentario_update);
router.delete('/delete/:idComentario', comentarioController.comentario_delete);
router.get('/list/:idForum', comentarioController.listarComentariosPorForum);
router.get('/listvalidos/:idForum', comentarioController.listarComentariosValidosPorForum);
router.get('/listforuminvalido', comentarioController.listarComentariosPorForumInv);
router.put('/validar/:idComentario', comentarioController.validarComentarioForum);
router.put('/invalidar/:idComentario', comentarioController.invalidarComentarioForum);

module.exports = router;
