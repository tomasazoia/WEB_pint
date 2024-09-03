const Topicos = require('../models/reportTopicos'); // Caminho para o model dos tópicos

// Listar todos os tópicos de denúncia
const getAllTopicos = async (req, res) => {
    try {
        const topicos = await Topicos.findAll();
        return res.status(200).json(topicos);
    } catch (error) {
        console.error('Erro ao listar os tópicos de denúncia:', error);
        return res.status(500).json({ error: 'Erro ao listar os tópicos de denúncia' });
    }
};

// Criar um novo tópico de denúncia
const createTopic = async (req, res) => {
    const { NOME_TOPICO } = req.body; // Recebe os dados do corpo da requisição

    if (!NOME_TOPICO) {
        return res.status(400).json({ error: 'O campo NOME_TOPICO é obrigatório' });
    }

    try {
        const novoTopico = await Topicos.create({
            NOME_TOPICO,
        });

        return res.status(201).json({ message: 'Tópico de denúncia criado com sucesso', topico: novoTopico });
    } catch (error) {
        console.error('Erro ao criar o tópico de denúncia:', error);
        return res.status(500).json({ error: 'Erro ao criar o tópico de denúncia' });
    }
};

// Eliminar um tópico de denúncia
const deleteTopic = async (req, res) => {
    const { id } = req.params; // Recebe o ID do tópico dos parâmetros da URL

    try {
        const topico = await Topicos.findByPk(id);

        if (!topico) {
            return res.status(404).json({ error: 'Tópico de denúncia não encontrado' });
        }

        await topico.destroy(); // Elimina o tópico da base de dados

        return res.status(200).json({ message: 'Tópico de denúncia eliminado com sucesso' });
    } catch (error) {
        console.error('Erro ao eliminar o tópico de denúncia:', error);
        return res.status(500).json({ error: 'Erro ao eliminar o tópico de denúncia' });
    }
};

module.exports = {
    getAllTopicos,
    createTopic,
    deleteTopic,
};