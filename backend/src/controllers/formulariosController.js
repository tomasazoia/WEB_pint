const Formularios = require('../models/formularios'); // Caminho para o model Formularios

// Listar todos os formulários
const getAllFormularios = async (req, res) => {
    try {
        const formularios = await Formularios.findAll();
        return res.status(200).json(formularios);
    } catch (error) {
        console.error('Erro ao listar os formulários:', error);
        return res.status(500).json({ error: 'Erro ao listar os formulários' });
    }
};

// Atualizar o campo ATIVO para false
const deactivateFormulario = async (req, res) => {
    const { id } = req.params; // Recebe o ID do formulário dos parâmetros da URL

    try {
        const formulario = await Formularios.findByPk(id);

        if (!formulario) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        formulario.ATIVO = false; // Define o campo ATIVO como false
        await formulario.save();

        return res.status(200).json({ message: 'Formulário desativado com sucesso', formulario });
    } catch (error) {
        console.error('Erro ao desativar o formulário:', error);
        return res.status(500).json({ error: 'Erro ao desativar o formulário' });
    }
};

// Criar um novo formulário
const createFormulario = async (req, res) => {
    const { NOME_FORMULARIO, ATIVO } = req.body; // Recebe os dados do corpo da requisição

    if (!NOME_FORMULARIO) {
        return res.status(400).json({ error: 'O campo NOME_FORMULARIO é obrigatório' });
    }

    try {
        const novoFormulario = await Formularios.create({
            NOME_FORMULARIO,
            ATIVO: ATIVO !== undefined ? ATIVO : true, // Define o valor padrão para ATIVO como true se não for fornecido
        });

        return res.status(201).json({ message: 'Formulário criado com sucesso', formulario: novoFormulario });
    } catch (error) {
        console.error('Erro ao criar o formulário:', error);
        return res.status(500).json({ error: 'Erro ao criar o formulário' });
    }
};

const activateFormulario = async (req, res) => {
    const { id } = req.params; // Recebe o ID do formulário dos parâmetros da URL

    try {
        const formulario = await Formularios.findByPk(id);

        if (!formulario) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        formulario.ATIVO = true; // Define o campo ATIVO como true
        await formulario.save();

        return res.status(200).json({ message: 'Formulário ativado com sucesso', formulario });
    } catch (error) {
        console.error('Erro ao ativar o formulário:', error);
        return res.status(500).json({ error: 'Erro ao ativar o formulário' });
    }
};
const checkFormularioStatus = async (req, res) => {
    const { id } = req.params; // Recebe o ID do formulário dos parâmetros da URL

    try {
        const formulario = await Formularios.findByPk(id, {
            attributes: ['ATIVO'] // Seleciona apenas o campo ATIVO
        });

        if (!formulario) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        return res.status(200).json({ ATIVO: formulario.ATIVO });
    } catch (error) {
        console.error('Erro ao verificar o estado do formulário:', error);
        return res.status(500).json({ error: 'Erro ao verificar o estado do formulário' });
    }
};

module.exports = {
    getAllFormularios,
    deactivateFormulario,
    createFormulario,
    activateFormulario,
    checkFormularioStatus
};
