const express = require('express');
const router = express.Router();
const { getAllFormularios, deactivateFormulario,createFormulario,activateFormulario, checkFormularioStatus } = require('../controllers/formulariosController');

// Rota para listar todos os formulários
router.get('/list', getAllFormularios);

// Rota para desativar um formulário pelo ID
router.put('/deactivate/:id', deactivateFormulario);
router.post('/create', createFormulario);
router.put('/activate/:id', activateFormulario);
router.get('/activate/:id', checkFormularioStatus);
router.get('/status/:id', checkFormularioStatus);


module.exports = router;
