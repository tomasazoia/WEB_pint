const ReportEventos = require('../models/reportEventos');
const ComentariosEvento = require('../models/comentarios_evento');
const ReportTopicos = require('../models/reportTopicos');
const Evento = require('../models/eventos');
const Centro = require('../models/centro');
const User = require('../models/users');

// Criar um novo report
const createReport = async (req, res) => {
    const { ID_COMENTARIO_REPORTADO, ID_TIPO_REPORT } = req.body; // Recebe os dados do corpo da requisição

    if (!ID_COMENTARIO_REPORTADO || !ID_TIPO_REPORT) {
        return res.status(400).json({ error: 'Os campos ID_COMENTARIO_REPORTADO e ID_TIPO_REPORT são obrigatórios' });
    }

    try {
        // Verificar se o comentário e o tópico existem
        const comentario = await ComentariosEvento.findByPk(ID_COMENTARIO_REPORTADO);
        const topico = await ReportTopicos.findByPk(ID_TIPO_REPORT);

        if (!comentario) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        if (!topico) {
            return res.status(404).json({ error: 'Tópico de report não encontrado' });
        }

        // Criar o novo report
        const novoReport = await ReportEventos.create({
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
    const userId = req.headers['user-id'];// Extraindo o ID do usuário dos headers

    try {
        // Obter o centro do administrador
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        // Recuperar o ID do centro associado ao utilizador
        const centroId = user.ID_CENTRO;

        if (!centroId) {
            return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
        }

        // Buscar reports associados aos eventos que pertencem ao centro do administrador
        const reports = await ReportEventos.findAll({
            include: [
                {
                    model: ComentariosEvento,
                    attributes: ['ID_COMENTARIO', 'DESCRICAO'],
                    as: "comentariosevento",
                    include: [
                        {
                            model: Evento,
                            attributes: ['ID_EVENTO', 'NOME_EVENTO'],
                            where: { ID_CENTRO: centroId }, // Filtra eventos pelo centro do usuário
                            as: "evento"
                        }
                    ]
                },
                {
                    model: ReportTopicos,
                    attributes: ['ID_TOPICO', 'NOME_TOPICO'],
                    as: "reporttopico"
                }
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
        const report = await ReportEventos.findByPk(id);

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