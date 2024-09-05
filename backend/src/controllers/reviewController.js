const Review = require('../models/review');
const Locais = require('../models/locais');
const Users = require('../models/users');
const Notificacoes = require('../models/notificacoes');

// Criar uma nova review
exports.createReview = async (req, res) => {
    const { ID_LOCAL, ID_CRIADOR, REVIEW } = req.body;

    try {
        // Verificar se o local existe
        const local = await Locais.findByPk(ID_LOCAL);
        if (!local) {
            return res.status(404).json({ error: 'Local não encontrado.' });
        }

        // Verificar se o utilizador que está criando a review existe
        const user = await Users.findByPk(ID_CRIADOR);
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Criar a review
        const newReview = await Review.create({
            ID_LOCAL,
            ID_CRIADOR,
            REVIEW
        });



        res.status(201).json(newReview);
    } catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).json({ error: 'Erro ao criar review.' });
    }
};



// Obter todas as reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Erro ao obter reviews:', error);
        res.status(500).json({ error: 'Erro ao obter reviews.' });
    }
};

// Obter uma review por ID
exports.getReviewById = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Review não encontrada.' });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error('Erro ao obter review:', error);
        res.status(500).json({ error: 'Erro ao obter review.' });
    }
};

// Atualizar uma review por ID
exports.updateReview = async (req, res) => {
    const { id } = req.params;
    const { REVIEW } = req.body;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Review não encontrada.' });
        }

        review.REVIEW = REVIEW;
        await review.save();

        res.status(200).json(review);
    } catch (error) {
        console.error('Erro ao atualizar review:', error);
        res.status(500).json({ error: 'Erro ao atualizar review.' });
    }
};

// Excluir uma review por ID
exports.deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Review não encontrada.' });
        }

        await review.destroy();

        res.status(200).json({ message: 'Review excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir review:', error);
        res.status(500).json({ error: 'Erro ao excluir review.' });
    }
};

// Adicionar uma review a um local específico
exports.addReviewToLocal = async (req, res) => {
    const { ID_LOCAL } = req.params;
    const { ID_CRIADOR, REVIEW } = req.body;

    try {
        // Verificar se o local existe
        const local = await Locais.findByPk(ID_LOCAL);

        if (!local) {
            return res.status(404).json({ error: 'Local não encontrado.' });
        }

        // Verificar se o utilizador que está criando a review existe
        const user = await Users.findByPk(ID_CRIADOR);

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Verificar se já existe uma review do utilizador para o local
        const existingReview = await Review.findOne({
            where: {
                ID_LOCAL,
                ID_CRIADOR
            }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'O utilizador já deixou uma review para este local.' });
        }

        // Criar a review associada ao local
        const newReview = await Review.create({
            ID_LOCAL,
            ID_CRIADOR,
            REVIEW
        });

        // Enviar uma notificação ao criador do local
        const criadorDoLocal = await Users.findByPk(local.ID_CRIADOR);
        if (criadorDoLocal) {
            const mensagem = `O utilizador ${user.user_name} deixou uma nova review no seu local: ${local.DESIGNACAO_LOCAL}.`;

            await Notificacoes.create({
                ID_USER: criadorDoLocal.ID_FUNCIONARIO, // ID do criador do local
                MENSAGEM: mensagem
            });
        }

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Erro ao adicionar review ao local:', error);
        res.status(500).json({ error: 'Erro ao adicionar review ao local.' });
    }
};


exports.getReviewsByLocal = async (req, res) => {
    const { id } = req.params;
    try {
        const count = await Review.count({ where: { ID_LOCAL: id } });
        res.json({ count });
    } catch (error) {
        console.error('Erro ao contar reviews:', error);
        res.status(500).json({ error: 'Erro ao contar reviews' });
    }
};

exports.getAverageReviewByLocal = async (req, res) => {
    try {
        const { id } = req.params;  // ID do local passado na URL

        // Consultar o banco de dados para obter todas as reviews associadas ao local
        const reviews = await Review.findAll({
            where: {
                ID_LOCAL: id  // Filtrar reviews pelo ID_LOCAL
            }
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Nenhuma review encontrada para este local.' });
        }

        // Calcular a média das reviews
        const total = reviews.reduce((acc, review) => acc + review.REVIEW, 0);
        const averageReview = total / reviews.length;

        // Retornar a média das reviews
        return res.status(200).json({ averageReview });
    } catch (error) {
        console.error('Erro ao calcular a média das reviews:', error);
        return res.status(500).json({ message: 'Erro ao calcular a média das reviews.', error });
    }
};

exports._getReviewsByLocal = async (req, res) => {
    const { id } = req.params; // ID do local passado na URL

    try {
        // Buscar todas as reviews associadas ao local pelo ID_LOCAL
        const reviews = await Review.findAll({
            where: {
                ID_LOCAL: id
            }
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Nenhuma review encontrada para este local.' });
        }

        // Retornar as reviews encontradas
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Erro ao obter reviews do local:', error);
        res.status(500).json({ error: 'Erro ao obter reviews do local.' });
    }
};