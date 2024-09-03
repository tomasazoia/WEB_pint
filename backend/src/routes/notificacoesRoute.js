const express = require('express');
const router = express.Router();
const {
    criarNotificacao,
    listarNotificacoesPorUsuario,
    marcarComoLida,
    excluirNotificacao
} = require('../controllers/notificacoesController');

// Rota para criar uma notificação
router.post('/create', criarNotificacao);

// Rota para listar notificações de um usuário
router.get('/user/:userId', listarNotificacoesPorUsuario);

// Rota para marcar notificação como lida
router.put('/read/:notificacaoId', marcarComoLida);

// Rota para excluir uma notificação
router.delete('/delete/:notificacaoId', excluirNotificacao);

module.exports = router;
