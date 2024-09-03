const express = require('express');
const router = express.Router();
const subAreaController = require('../controllers/subAreasController');

// Rotas CRUD para SubAreas
router.post('/create', subAreaController.createSubArea);
router.get('/list', subAreaController.getAllSubAreas);
router.get('/listbyid/:id', subAreaController.getSubAreaById);
router.get('/list/:areaId', subAreaController.getSubAreasByAreaId);
router.put('/update/:id', subAreaController.updateSubArea);
router.delete('/delete/:id', subAreaController.deleteSubArea);
router.post('/check', subAreaController.subAreaCheck);
router.post('/checknormal', subAreaController.subAreaCheckNormal);

module.exports = router;
