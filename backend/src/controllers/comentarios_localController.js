const ComentariosLocal = require('../models/comentarios_local');
const users = require('../models/users');
const Local = require('../models/locais');
const Notificacoes = require('../models/notificacoes');

const addComentarioLocal = async (req, res) => {
    const { ID_FUNCIONARIO, ID_LOCAL, DESCRICAO } = req.body;

    console.log('Recebendo requisição para adicionar comentário ao local:', req.body);

    if (!ID_FUNCIONARIO || !ID_LOCAL || !DESCRICAO) {
        console.log('Campos obrigatórios faltando:', req.body);
        return res.status(400).json({ error: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    try {
        const user = await users.findByPk(ID_FUNCIONARIO);
        if (!user) {
            console.log('Utilizador não encontrado:', ID_FUNCIONARIO);
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        const comentarioLocal = await ComentariosLocal.create({
            ID_FUNCIONARIO,
            ID_LOCAL,
            DATA_COMENTARIO: new Date(),
            DESCRICAO
        });

        console.log('Comentário criado com sucesso no local:', comentarioLocal);
        res.status(201).json(comentarioLocal);
    } catch (error) {
        console.error('Erro ao criar comentário no local:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o comentário no local.' });
    }
};

const listarComentariosLocal = async (req, res) => {
    try {
        const comentarios = await ComentariosLocal.findAll();
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários do local:', error);
        res.status(500).json({ message: 'Erro ao listar comentários do local.', error: error.message });
    }
};

const listarComentariosPorLocal = async (req, res) => {
    const { idLocal } = req.params;

    try {
        const comentarios = await ComentariosLocal.findAll({
            where: {
                ID_LOCAL: idLocal,
                VALIDAR: true  // Filtra para mostrar apenas comentários validados
            },
            include: [{
                model: users,
                as: 'User', // Alias utilizado na associação
                attributes: ['user_name'] // Apenas os atributos que deseja retornar
            }],
        });

        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários por local:', error);
        res.status(500).json({ message: 'Erro ao listar comentários por local.', error: error.message });
    }
};

const deleteComentarioLocal = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioLocal = await ComentariosLocal.findByPk(idComentario);
        if (!comentarioLocal) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        await comentarioLocal.destroy();
        res.status(200).json({ message: 'Comentário apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar comentário do local:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao apagar o comentário do local.' });
    }
};

const listarComentariosPorAreaLocal = async (req, res) => {
    const { id } = req.params;

    try {
        const comentarios = await ComentariosLocal.findAll({
            where: { ID_AREA: id },
            include: [users]
        });

        if (!comentarios.length) {
            return res.status(404).json({ error: 'Nenhum comentário encontrado para esta área.' });
        }

        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar fóruns por área do local:', error);
        res.status(500).json({ message: 'Erro ao listar fóruns por área do local.', error: error.message });
    }
};

const validarComentarioLocal = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioLocal = await ComentariosLocal.findByPk(idComentario);
        if (!comentarioLocal) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        comentarioLocal.VALIDAR = true;
        await comentarioLocal.save();

        const locais = await Local.findByPk(comentarioLocal.ID_LOCAL);
        if (!locais) {
            console.log('Evento não encontrado:', comentarioLocal.ID_LOCAL);
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }
            // Envia uma notificação ao criador do evento
            const user = await users.findByPk(comentarioLocal.ID_FUNCIONARIO);
            const mensagem = `O utilizador ${user.user_name} comentou na sua recomendacao: ${locais.DESIGNACAO_LOCAL}.`;
            
            await Notificacoes.create({
                ID_USER: locais.ID_CRIADOR, // ID do criador do evento
                MENSAGEM: mensagem
            });

            console.log('Notificação enviada ao criador do evento:', locais.ID_CRIADOR);
        


        res.status(200).json({ message: 'Comentário validado com sucesso.', comentario: comentarioLocal });
    } catch (error) {
        console.error('Erro ao validar comentário do local:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao validar o comentário do local.' });
    }
};

const invalidarComentarioLocal = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioLocal = await ComentariosLocal.findByPk(idComentario);
        if (!comentarioLocal) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        comentarioLocal.VALIDAR = false;
        await comentarioLocal.save();

        res.status(200).json({ message: 'Comentário invalidado com sucesso.', comentario: comentarioLocal });
    } catch (error) {
        console.error('Erro ao invalidar comentário do local:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao invalidar o comentário do local.' });
    }
};

const listarComentariosPorLocalInv = async (req, res) => {
    try {
        const comentarios = await ComentariosLocal.findAll({
            where: {
                VALIDAR: false
            },
            include: [{
                model: Local,
                as: 'local', // Alias utilizado na associação
                attributes: ['DESIGNACAO_LOCAL'] // Apenas os atributos que deseja retornar
            }],
        });
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários do local:', error);
        res.status(500).json({ message: 'Erro ao listar comentários do local.', error: error.message });
    }
};

const listarQuantidadeComentariosLocais = async (req, res) => {
    try {
        // Contagem de comentários validados
        const comentariosValidados = await ComentariosLocal.count({
            where: { VALIDAR: true }
        });

        res.status(200).json({
            comentariosValidados,
        });
    } catch (error) {
        console.error('Erro ao listar quantidade de comentários:', error);
        res.status(500).json({ message: 'Erro ao listar quantidade de comentários.', error: error.message });
    }
};

module.exports = {
    addComentarioLocal,
    listarComentariosLocal,
    listarComentariosPorLocal,
    deleteComentarioLocal,
    listarComentariosPorAreaLocal,
    validarComentarioLocal,
    invalidarComentarioLocal,
    listarComentariosPorLocalInv,
    listarQuantidadeComentariosLocais
};
