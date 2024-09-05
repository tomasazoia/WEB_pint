const express = require('express');
const router = express.Router();
const reviewComentariosLocalController = require('../controllers/review_comentarios_localController');

router.post('/create', reviewComentariosLocalController.createReview);
router.get('/list', reviewComentariosLocalController.getAllReviews);
router.get('/detail/:id', reviewComentariosLocalController.getReviewById);
router.delete('/delete/:id', reviewComentariosLocalController.deleteReview);
router.post('/comentario/:id', reviewComentariosLocalController.addReviewToComentario);
router.get('/comentario/count/:id', reviewComentariosLocalController.countReviewsByComentario);
router.get('/comentario/average/:id', reviewComentariosLocalController.getAverageReviewByComentario);
router.get('/comentarioreviews/:id', reviewComentariosLocalController.getReviewsByComentario);

module.exports = router;
