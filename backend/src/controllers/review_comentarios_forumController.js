const ReviewComentariosForum = require('../models/review_comentarios_forum');
const Comentarios = require('../models/comentarios_forum');
const Users = require('../models/users');

// Criar uma nova review de um comentário no fórum
exports.createReview = async (req, res) => {
    const { ID_COMENTARIO, ID_CRIADOR, REVIEW } = req.body;

    try {
        // Verificar se o comentário existe
        const comentario = await Comentarios.findByPk(ID_COMENTARIO);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        // Verificar se o utilizador que está criando a review existe
        const user = await Users.findByPk(ID_CRIADOR);
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Criar a review
        const newReview = await ReviewComentariosForum.create({
            ID_COMENTARIO,
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
        const reviews = await ReviewComentariosForum.findAll();
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
        const review = await ReviewComentariosForum.findByPk(id);

        if (!review) {
            return res.status(404).json({ error: 'Review não encontrada.' });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error('Erro ao obter review:', error);
        res.status(500).json({ error: 'Erro ao obter review.' });
    }
};

// Excluir uma review por ID
exports.deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        const review = await ReviewComentariosForum.findByPk(id);

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

// Adicionar uma review a um comentário específico no fórum
exports.addReviewToComentario = async (req, res) => {
    const { id: ID_COMENTARIO } = req.params;
    const { ID_CRIADOR, REVIEW } = req.body;

    try {
        // Verificar se o comentário existe
        const comentario = await Comentarios.findByPk(ID_COMENTARIO);

        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        // Verificar se o utilizador que está criando a review existe
        const user = await Users.findByPk(ID_CRIADOR);

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Criar a review associada ao comentário
        const newReview = await ReviewComentariosForum.create({
            ID_COMENTARIO,
            ID_CRIADOR,
            REVIEW
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Erro ao adicionar review ao comentário:', error);
        res.status(500).json({ error: 'Erro ao adicionar review ao comentário.' });
    }
};

// Contar o número de reviews de um comentário no fórum
exports.countReviewsByComentario = async (req, res) => {
    const { id } = req.params;
    try {
        const count = await ReviewComentariosForum.count({ where: { ID_COMENTARIO: id } });
        res.json({ count });
    } catch (error) {
        console.error('Erro ao contar reviews:', error);
        res.status(500).json({ error: 'Erro ao contar reviews.' });
    }
};

// Calcular a média das reviews de um comentário no fórum
exports.getAverageReviewByComentario = async (req, res) => {
    const { id } = req.params;

    try {
        const reviews = await ReviewComentariosForum.findAll({
            where: { ID_COMENTARIO: id }
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Nenhuma review encontrada para este comentário.' });
        }

        const total = reviews.reduce((acc, review) => acc + review.REVIEW, 0);
        const averageReview = total / reviews.length;

        res.status(200).json({ averageReview });
    } catch (error) {
        console.error('Erro ao calcular a média das reviews:', error);
        res.status(500).json({ message: 'Erro ao calcular a média das reviews.' });
    }
};

// Listar todas as reviews de um comentário específico no fórum
exports.getReviewsByComentario = async (req, res) => {
    const { id } = req.params;

    try {
        const reviews = await ReviewComentariosForum.findAll({
            where: { ID_COMENTARIO: id }
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Nenhuma review encontrada para este comentário.' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Erro ao obter reviews do comentário:', error);
        res.status(500).json({ error: 'Erro ao obter reviews do comentário.' });
    }
};