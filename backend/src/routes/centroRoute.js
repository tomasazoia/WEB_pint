const express = require('express');
const router = express.Router();
const createCentro = require('../controllers/centroController'); 

router.post('/create', createCentro.createCentro);
router.get('/list', createCentro.listCentros);
router.delete('/delete/:id', createCentro.deleteCentro);
router.put('/edit/:id', createCentro.updateCentro);

module.exports = router;
