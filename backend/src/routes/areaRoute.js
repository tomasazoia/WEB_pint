const express = require('express');
const areaController = require('../controllers/areaController');
const router = express.Router();

router.post('/create', areaController.createArea);
router.get('/list', areaController.listAreas);
router.delete('/delete/:id', areaController.deleteArea);
router.put('/update/:id', areaController.updateArea);

module.exports = router;