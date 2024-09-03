const express = require('express');
const router = express.Router();
const reportForumsController = require('../controllers/reportForumsController');

router.get('/list', reportForumsController.getAllReports);
router.post('/create', reportForumsController.createReport);
router.delete('/delete/:id', reportForumsController.deleteReport);

module.exports = router;