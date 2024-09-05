const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// CRUD Routes
router.post('/create', reviewController.createReview); // Criar uma nova review
router.get('/list', reviewController.getAllReviews); // Obter todas as reviews
router.get('/detail/:id', reviewController.getReviewById); // Obter uma review específica
router.put('/update/:id', reviewController.updateReview); // Atualizar uma review específica
router.delete('/delete/:id', reviewController.deleteReview); // Excluir uma review específica

// Route para adicionar uma review a um local específico
router.post('/local/:ID_LOCAL', reviewController.addReviewToLocal);
router.get('/get/local/:id', reviewController.getReviewById);
router.get('/local/get/:id', reviewController.getReviewsByLocal);
router.get('/average/local/:id', reviewController.getAverageReviewByLocal);
router.get('/localreviews/:id', reviewController._getReviewsByLocal);


module.exports = router;
