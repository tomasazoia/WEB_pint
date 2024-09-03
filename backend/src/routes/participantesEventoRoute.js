const express = require('express');
const router = express.Router();
const participantesController = require('../controllers/participantes_eventoController');

// Rota para adicionar participante
router.post('/participantes', participantesController.createParticipante);

// Rota para editar participante
router.put('/participantes/:ID_FUNCIONARIO/:ID_EVENTO', participantesController.updateParticipante);

// Rota para remover participante
router.delete('/participantesdelete/:ID_FUNCIONARIO/:ID_EVENTO', participantesController.deleteParticipante);
router.get('/eventos/:ID_EVENTO/participantes', participantesController.listarParticipantesEvento);
router.get('/funcionario/:ID_FUNCIONARIO/eventos', participantesController.listarEventosFuncionario);
module.exports = router;
