const Informacoes = require('../models/infosEAvisos');
const Users = require('../models/users');

const criarInformacao = async (req, res) => {
    try {
        // Validação dos campos recebidos
        const { TITULO, DESCRICAO, ID_CRIADOR } = req.body;

        const user = await Users.findByPk(ID_CRIADOR);

        if (!user) {
          return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        if (!TITULO || !DESCRICAO) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // Criação da nova informação
        const novaInformacao = await Informacoes.create({
            TITULO,
            DESCRICAO,
            ID_CRIADOR
        });

        res.status(201).json({ message: 'Informação criada com sucesso!', informacao: novaInformacao });
    } catch (error) {
        console.error('Erro ao criar informação:', error);
        res.status(500).json({ message: 'Erro ao criar informação.', error: error.message });
    }
};
const editarInformacao = async (req, res) => {
    try {
        const informacaoId = req.params.id;
        const { TITULO, DESCRICAO } = req.body;

        const informacao = await Informacoes.findByPk(informacaoId);

        if (!informacao) {
            return res.status(404).json({ message: 'Informação não encontrada.' });
        }

        informacao.TITULO = TITULO || informacao.TITULO;
        informacao.DESCRICAO = DESCRICAO || informacao.DESCRICAO;

        await informacao.save();

        res.status(200).json({ message: 'Informação editada com sucesso!', informacao });
    } catch (error) {
        console.error('Erro ao editar informação:', error);
        res.status(500).json({ message: 'Erro ao editar informação.', error: error.message });
    }
};
const eliminarInformacao = async (req, res) => {
    try {
        const informacaoId = req.params.id;

        const informacao = await Informacoes.findByPk(informacaoId);

        if (!informacao) {
            return res.status(404).json({ message: 'Informação não encontrada.' });
        }

        await informacao.destroy();

        res.status(200).json({ message: 'Informação eliminada com sucesso!' });
    } catch (error) {
        console.error('Erro ao eliminar informação:', error);
        res.status(500).json({ message: 'Erro ao eliminar informação.', error: error.message });
    }
};
const listarInformacoes = async (req, res) => {
    try {
        const informacoes = await Informacoes.findAll({
            order: [['DATA_CRIACAO', 'DESC']],
        });

        res.status(200).json(informacoes);
    } catch (error) {
        console.error('Erro ao listar informações:', error);
        res.status(500).json({ message: 'Erro ao listar informações.', error: error.message });
    }
};

module.exports = {
    criarInformacao,
    editarInformacao,
    eliminarInformacao,
    listarInformacoes
};