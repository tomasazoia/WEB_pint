const express = require('express');
const router = express.Router();
const reportTopicosController = require('../controllers/reportTopicosController');

router.get('/list', reportTopicosController.getAllTopicos);
router.post('/create', reportTopicosController.createTopic);
router.delete('/delete/:id', reportTopicosController.deleteTopic);

module.exports = router;