const Notificacoes = require('../models/notificacoes');

// Cria uma nova notificação
const criarNotificacao = async (req, res) => {
    const { ID_USER, MENSAGEM } = req.body;

    if (!ID_USER || !MENSAGEM) {
        return res.status(400).json({ error: 'ID_USER e MENSAGEM são obrigatórios.' });
    }

    try {
        const novaNotificacao = await Notificacoes.create({ ID_USER, MENSAGEM });
        res.status(201).json(novaNotificacao);
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        res.status(500).json({ error: 'Erro ao criar notificação.' });
    }
};

const listarNotificacoesPorUsuario = async (req, res) => {
    const { userId } = req.params;

    try {
        const notificacoes = await Notificacoes.findAll({
            where: { ID_USER: userId },
            order: [['ID_NOTIFICACAO', 'DESC']]
        });

        res.status(200).json(notificacoes);
    } catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({ error: 'Erro ao listar notificações.' });
    }
};
const marcarComoLida = async (req, res) => {
    const { notificacaoId } = req.params;

    try {
        const notificacao = await Notificacoes.findByPk(notificacaoId);

        if (!notificacao) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        notificacao.LIDA = true;
        await notificacao.save();

        res.status(200).json({ message: 'Notificação marcada como lida.' });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro ao marcar notificação como lida.' });
    }
};

const excluirNotificacao = async (req, res) => {
    const { notificacaoId } = req.params;

    try {
        const notificacao = await Notificacoes.findByPk(notificacaoId);

        if (!notificacao) {
            return res.status(404).json({ error: 'Notificação não encontrada.' });
        }

        await notificacao.destroy();
        res.status(200).json({ message: 'Notificação excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        res.status(500).json({ error: 'Erro ao excluir notificação.' });
    }
};

module.exports = { criarNotificacao,listarNotificacoesPorUsuario, marcarComoLida ,excluirNotificacao};