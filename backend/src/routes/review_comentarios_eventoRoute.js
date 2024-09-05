const express = require('express');
const router = express.Router();
const reviewComentariosEventoController = require('../controllers/review_comentarios_eventoController');

router.post('/create', reviewComentariosEventoController.createReview);
router.get('/list', reviewComentariosEventoController.getAllReviews);
router.get('/detail/:id', reviewComentariosEventoController.getReviewById);
router.delete('/delete/:id', reviewComentariosEventoController.deleteReview);
router.post('/comentario/:id', reviewComentariosEventoController.addReviewToComentario);
router.get('/comentario/count/:id', reviewComentariosEventoController.countReviewsByComentario);
router.get('/comentario/average/:id', reviewComentariosEventoController.getAverageReviewByComentario);
router.get('/comentarioreviews/:id', reviewComentariosEventoController.getReviewsByComentario);

module.exports = router;