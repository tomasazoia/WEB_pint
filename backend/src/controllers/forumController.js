const Forum = require('../models/forum');
const users = require('../models/users');
const Centro = require('../models/centro');
const Areas = require('../models/area');
const ComentariosForum = require('../models/comentarios_forum');

const addForum = async (req, res) => {
    const { ID_CENTRO, ID_AREA, ID_CRIADOR, NOME_FORUM } = req.body;

    console.log('Recebendo requisição para adicionar fórum:', req.body);

    if (!ID_CENTRO || !ID_AREA || !ID_CRIADOR || !NOME_FORUM) {
        console.log('Campos obrigatórios faltando:', req.body);
        return res.status(400).json({ error: 'Por favor, forneça todos os campos obrigatórios.' });
    }

    try {
        const user = await users.findByPk(ID_CRIADOR);
        if (!user) {
            console.log('utilizador não encontrado:', ID_CRIADOR);
            return res.status(404).json({ error: 'utilizador não encontrado.' });
        }

        const forum = await Forum.create({
            ID_CENTRO,
            ID_AREA,
            ID_CRIADOR,
            NOME_FORUM
        });

        console.log('Fórum criado com sucesso:', forum);
        res.status(201).json(forum);
    } catch (error) {
        console.error('Erro ao criar fórum:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o fórum.' });
    }
};

const listarForums = async (req, res) => {
    try {
        const forums = await Forum.findAll({
            include: [Centro, Areas, users]
        });
        res.status(200).json(forums);
    } catch (error) {
        console.error('Erro ao listar fóruns:', error);
        res.status(500).json({ message: 'Erro ao listar fóruns.', error: error.message });
    }
};

const deleteForum = async (req, res) => {
    const { idForum } = req.params;

    try {
        const forum = await Forum.findByPk(idForum);
        if (!forum) {
            return res.status(404).json({ error: 'Fórum não encontrado.' });
        }

        await ComentariosForum.destroy({ where: { ID_FORUM: idForum } });

        await forum.destroy();

        res.status(200).json({ message: 'Fórum apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar fórum:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao apagar o fórum.' });
    }
};

const listarForumsPorArea = async (req, res) => {
    const { id } = req.params;

    try {
        const forums = await Forum.findAll({
            where: { ID_AREA: id },
            include: [Centro, Areas, users]
        });

        if (!forums.length) {
            return res.status(404).json({ error: 'Nenhum fórum encontrado para esta área.' });
        }

        res.status(200).json(forums);
    } catch (error) {
        console.error('Erro ao listar fóruns por área:', error);
        res.status(500).json({ message: 'Erro ao listar fóruns por área.', error: error.message });
    }
};

const forumDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const forum = await Forum.findByPk(id, {
            include: [Centro, Areas, users]
        });

        if (!forum) {
            return res.status(404).json({ error: 'Fórum não encontrado.' });
        }

        res.status(200).json(forum);
    } catch (error) {
        console.error('Erro ao obter detalhes do fórum:', error);
        res.status(500).json({ message: 'Erro ao obter detalhes do fórum.', error: error.message });
    }
};

module.exports = {
    addForum,
    listarForums,
    deleteForum,
    listarForumsPorArea,
    forumDetail
};