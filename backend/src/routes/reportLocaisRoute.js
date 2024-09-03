const express = require('express');
const router = express.Router();
const reportLocaisController = require('../controllers/reportLocaisController');

router.get('/list', reportLocaisController.getAllReports);
router.post('/create', reportLocaisController.createReport);
router.delete('/delete/:id', reportLocaisController.deleteReport);

module.exports = router;