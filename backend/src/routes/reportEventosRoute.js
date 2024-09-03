const express = require('express');
const router = express.Router();
const reportEventosController = require('../controllers/reportEventosController');

router.get('/list', reportEventosController.getAllReports);
router.post('/create', reportEventosController.createReport);
router.delete('/delete/:id', reportEventosController.deleteReport);

module.exports = router;