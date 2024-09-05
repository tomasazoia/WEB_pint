const express = require('express');
const router = express.Router();
const reviewComentariosForumController = require('../controllers/review_comentarios_forumController');

router.post('/create', reviewComentariosForumController.createReview);
router.get('/list', reviewComentariosForumController.getAllReviews);
router.get('/detail/:id', reviewComentariosForumController.getReviewById);
router.delete('/delete/:id', reviewComentariosForumController.deleteReview);
router.post('/comentario/:id', reviewComentariosForumController.addReviewToComentario);
router.get('/comentario/count/:id', reviewComentariosForumController.countReviewsByComentario);
router.get('/comentario/average/:id', reviewComentariosForumController.getAverageReviewByComentario);
router.get('/comentarioreviews/:id', reviewComentariosForumController.getReviewsByComentario);

module.exports = router;
