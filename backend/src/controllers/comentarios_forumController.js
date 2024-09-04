const ComentariosForum = require('../models/comentarios_forum');
const Forum = require('../models/forum');
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

const listarComentariosPorForumInv = async (req, res) => {
    try {
        const comentarios = await ComentariosForum.findAll({
            where: {
                VALIDAR: false
            },
            include: [{
                model: Forum,
                as: 'forum', // Alias utilizado na associação
                attributes: ['NOME_FORUM'] // Apenas os atributos que deseja retornar
            }],
        });
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ message: 'Erro ao listar comentários.', error: error.message });
    }
};
const invalidarComentarioForum = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioForum = await ComentariosForum.findByPk(idComentario);
        if (!comentarioForum) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        comentarioForum.VALIDAR = false;
        await comentarioForum.save();

        res.status(200).json({ message: 'Comentário invalidado com sucesso.', comentario: comentarioForum });
    } catch (error) {
        console.error('Erro ao invalidar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao invalidar o comentário.' });
    }
};

const validarComentarioForum = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioForum = await ComentariosForum.findByPk(idComentario);
        if (!comentarioForum) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        // Atualiza o status de validação do comentário
        comentarioForum.VALIDAR = true;
        await comentarioForum.save();

        // Busca o fórum para obter o ID do criador
        const forum = await Forum.findByPk(comentarioForum.ID_FORUM);
        if (!forum) {
            console.log('Fórum não encontrado:', comentarioForum.ID_FORUM);
            return res.status(404).json({ error: 'Fórum não encontrado.' });
        }

        // Envia uma notificação ao criador do fórum
        const user = await Users.findByPk(comentarioForum.ID_FUNCIONARIO);
        const mensagem = `O utilizador ${user.user_name} comentou no seu fórum: ${forum.TITULO_FORUM}.`;

        await Notificacoes.create({
            ID_USER: forum.ID_CRIADOR, // ID do criador do fórum
            MENSAGEM: mensagem
        });

        console.log('Notificação enviada ao criador do fórum:', forum.ID_CRIADOR);

        res.status(200).json({ message: 'Comentário validado com sucesso.', comentario: comentarioForum });
    } catch (error) {
        console.error('Erro ao validar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao validar o comentário.' });
    }
};

module.exports = {
    comentario_list,
    comentario_detail,
    comentario_create,
    comentario_update,
    comentario_delete,
    listarComentariosPorForum,
    listarComentariosPorForumInv,
    invalidarComentarioForum,
    validarComentarioForum
};