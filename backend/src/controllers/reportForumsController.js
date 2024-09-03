const ReportForums = require('../models/reportForums');
const ComentariosForum = require('../models/comentarios_forum');
const ReportTopicos = require('../models/reportTopicos');

// Criar um novo report
const createReport = async (req, res) => {
    const { ID_COMENTARIO_REPORTADO, ID_TIPO_REPORT } = req.body; // Recebe os dados do corpo da requisição

    if (!ID_COMENTARIO_REPORTADO || !ID_TIPO_REPORT) {
        return res.status(400).json({ error: 'Os campos ID_COMENTARIO_REPORTADO e ID_TIPO_REPORT são obrigatórios' });
    }

    try {
        // Verificar se o comentário e o tópico existem
        const comentario = await ComentariosForum.findByPk(ID_COMENTARIO_REPORTADO);
        const topico = await ReportTopicos.findByPk(ID_TIPO_REPORT);

        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        if (!topico) {
            return res.status(404).json({ error: 'Tópico de report não encontrado' });
        }

        // Criar o novo report
        const novoReport = await ReportForums.create({
            ID_COMENTARIO_REPORTADO,
            ID_TIPO_REPORT
        });

        return res.status(201).json({ message: 'Report criado com sucesso', report: novoReport });
    } catch (error) {
        console.error('Erro ao criar o report:', error);
        return res.status(500).json({ error: 'Erro ao criar o report' });
    }
};

// Listar todos os reports
const getAllReports = async (req, res) => {
    try {
        const reports = await ReportForums.findAll({
            include: [
                { model: ComentariosForum, attributes: ['ID_COMENTARIO', 'DESCRICAO'] },
                { model: ReportTopicos, attributes: ['ID_TOPICO', 'NOME_TOPICO'] }
            ]
        });
        return res.status(200).json(reports);
    } catch (error) {
        console.error('Erro ao listar os reports:', error);
        return res.status(500).json({ error: 'Erro ao listar os reports' });
    }
};

// Eliminar um report
const deleteReport = async (req, res) => {
    const { id } = req.params; // Recebe o ID do report dos parâmetros da URL

    try {
        const report = await ReportForums.findByPk(id);

        if (!report) {
            return res.status(404).json({ error: 'Report não encontrado' });
        }

        await report.destroy(); // Elimina o report da base de dados

        return res.status(200).json({ message: 'Report eliminado com sucesso' });
    } catch (error) {
        console.error('Erro ao eliminar o report:', error);
        return res.status(500).json({ error: 'Erro ao eliminar o report' });
    }
};

module.exports = {
    createReport,
    getAllReports,
    deleteReport
};