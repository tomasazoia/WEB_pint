const ComentariosForum = require('../models/comentarios_forum');

// Listar todos os comentários
const comentario_list = async (req, res) => {
    try {
        const comentarios = await ComentariosForum.findAll();
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao listar os comentários.' });
    }
};

// Detalhes de um comentário específico
const comentario_detail = async (req, res) => {
    try {
        const { id } = req.params;
        const comentario = await ComentariosForum.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }
        res.status(200).json(comentario);
    } catch (error) {
        console.error('Erro ao obter detalhes do comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao obter detalhes do comentário.' });
    }
};

// Criar um novo comentário
const comentario_create = async (req, res) => {
    try {
        const { ID_FORUM, DESCRICAO, DATA_COMENTARIO, ID_FUNCIONARIO } = req.body;
        if (!ID_FORUM || !DESCRICAO || !DATA_COMENTARIO || !ID_FUNCIONARIO) {
            return res.status(400).json({ error: 'Os campos ID_FORUM, DESCRICAO, DATA_COMENTARIO e ID_FUNCIONARIO são obrigatórios.' });
        }
        const novoComentario = await ComentariosForum.create({
            ID_FORUM,
            DESCRICAO,
            DATA_COMENTARIO,
            ID_FUNCIONARIO
        });
        res.status(201).json(novoComentario);
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o comentário.' });
    }
};

// Atualizar um comentário existente
const comentario_update = async (req, res) => {
    try {
        const { id } = req.params;
        const { DESCRICAO, DATA_COMENTARIO } = req.body;

        const comentario = await ComentariosForum.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        comentario.DESCRICAO = DESCRICAO || comentario.DESCRICAO;
        comentario.DATA_COMENTARIO = DATA_COMENTARIO || comentario.DATA_COMENTARIO;

        await comentario.save();
        res.status(200).json(comentario);
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao atualizar o comentário.' });
    }
};

// Apagar um comentário
const comentario_delete = async (req, res) => {
    try {
        const { idComentario } = req.params;

        const comentario = await ComentariosForum.findByPk(idComentario);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        await comentario.destroy();
        res.status(200).json({ message: 'Comentário apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao apagar o comentário.' });
    }
};

// Listar comentários por fórum
const listarComentariosPorForum = async (req, res) => {
    try {
        const { idForum } = req.params;
        const comentarios = await ComentariosForum.findAll({ where: { ID_FORUM: idForum } });
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários por fórum:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao listar os comentários por fórum.' });
    }
};

module.exports = {
    comentario_list,
    comentario_detail,
    comentario_create,
    comentario_update,
    comentario_delete,
    listarComentariosPorForum
};