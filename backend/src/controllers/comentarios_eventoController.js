const ComentariosEvento = require('../models/comentarios_evento');
const users = require('../models/users');
const evento = require('../models/eventos');
const Notificacoes = require('../models/notificacoes');
const { Op } = require('sequelize');
const  sequelize  = require('sequelize');

const addComentario = async (req, res) => {
    const { ID_FUNCIONARIO, ID_EVENTO, DESCRICAO } = req.body;

    console.log('Recebendo requisição para adicionar comentário:', req.body); 

    if (!ID_FUNCIONARIO || !ID_EVENTO || !DESCRICAO) {
        console.log('Campos obrigatórios faltando:', req.body);
        return res.status(400).json({ error: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    try {
        // Verifica se o utilizador existe
        const user = await users.findByPk(ID_FUNCIONARIO);
        if (!user) {
            console.log('Utilizador não encontrado:', ID_FUNCIONARIO);
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Cria o comentário
        const comentarioEvento = await ComentariosEvento.create({
            ID_FUNCIONARIO,
            ID_EVENTO,
            DATA_COMENTARIO: new Date(),
            DESCRICAO
        });

        console.log('Comentário criado com sucesso:', comentarioEvento);

        res.status(201).json(comentarioEvento);
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o comentário.' });
    }
};


const listarComentarios = async (req, res) => {
    try {
        const comentarios = await ComentariosEvento.findAll();
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ message: 'Erro ao listar comentários.', error: error.message });
    }
};

const listarComentariosPorEvento = async (req, res) => {
    const { idEvento } = req.params;

    try {
        const comentarios = await ComentariosEvento.findAll({
            where: {
                ID_EVENTO: idEvento,
                VALIDAR: true // Filtra para mostrar apenas comentários validados
            },
            include: [{
                model: users,
                as: 'User', // Alias utilizado na associação
                attributes: ['user_name'] // Apenas os atributos que deseja retornar
            },],
        });

        if (!comentarios.length) {
            return res.status(404).json({ error: 'Nenhum comentário encontrado para este evento.' });
        }

        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários por evento:', error);
        res.status(500).json({ message: 'Erro ao listar comentários por evento.', error: error.message });
    }
};

const deleteComentario = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioEvento = await ComentariosEvento.findByPk(idComentario);
        if (!comentarioEvento) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        await comentarioEvento.destroy();
        res.status(200).json({ message: 'Comentário apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao apagar o comentário.' });
    }
};

const listarComentariosPorArea = async (req, res) => {
    const { id } = req.params;

    try {
        const comentarios = await ComentariosEvento.findAll({
            where: { ID_AREA: id },
            include: [users]
        });

        if (!comentarios.length) {
            return res.status(404).json({ error: 'Nenhum comentário encontrado para esta área.' });
        }

        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar fóruns por área:', error);
        res.status(500).json({ message: 'Erro ao listar fóruns por área.', error: error.message });
    }
};

const validarComentario = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioEvento = await ComentariosEvento.findByPk(idComentario);
        if (!comentarioEvento) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        // Atualiza o status de validação do comentário
        comentarioEvento.VALIDAR = true;
        await comentarioEvento.save();

        // Busca o evento para obter o ID do criador
        const eventos = await evento.findByPk(comentarioEvento.ID_EVENTO);
        if (!eventos) {
            console.log('Evento não encontrado:', comentarioEvento.ID_EVENTO);
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }
            // Envia uma notificação ao criador do evento
            const user = await users.findByPk(comentarioEvento.ID_FUNCIONARIO);
            const mensagem = `O utilizador ${user.user_name} comentou no seu evento: ${eventos.NOME_EVENTO}.`;
            
            await Notificacoes.create({
                ID_USER: eventos.ID_CRIADOR, // ID do criador do evento
                MENSAGEM: mensagem
            });

            console.log('Notificação enviada ao criador do evento:', eventos.ID_CRIADOR);
        

        res.status(200).json({ message: 'Comentário validado com sucesso.', comentario: comentarioEvento });
    } catch (error) {
        console.error('Erro ao validar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao validar o comentário.' });
    }
};

const invalidarComentario = async (req, res) => {
    const { idComentario } = req.params;

    try {
        const comentarioEvento = await ComentariosEvento.findByPk(idComentario);
        if (!comentarioEvento) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        comentarioEvento.VALIDAR = false;
        await comentarioEvento.save();

        res.status(200).json({ message: 'Comentário invalidado com sucesso.', comentario: comentarioEvento });
    } catch (error) {
        console.error('Erro ao invalidar comentário:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao invalidar o comentário.' });
    }
};

const listarComentariosPorEventoInv = async (req, res) => {
    try {
        const comentarios = await ComentariosEvento.findAll({
            where: {
                VALIDAR: false
            },
            include: [{
                model: evento,
                as: 'evento', // Alias utilizado na associação
                attributes: ['NOME_EVENTO'] // Apenas os atributos que deseja retornar
            },],
        });
        res.status(200).json(comentarios);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ message: 'Erro ao listar comentários.', error: error.message });
    }
};

// Controller para listar a quantidade de comentários
const listarQuantidadeComentarios = async (req, res) => {
    try {
        // Contagem de comentários validados
        const comentariosValidados = await ComentariosEvento.count({
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
    addComentario,
    listarComentarios,
    listarComentariosPorEvento,
    deleteComentario,
    listarComentariosPorArea,
    validarComentario,
    invalidarComentario,
    listarComentariosPorEventoInv,
    listarQuantidadeComentarios
};
