const ParticipantesEvento = require('../models/participantes_evento');
const Evento = require('../models/eventos');
const User = require('../models/users');
const Notificacoes = require('../models/notificacoes');

// Adicionar participante a um evento
exports.createParticipante = async (req, res) => {
    const { ID_FUNCIONARIO, ID_EVENTO } = req.body;

    try {
        // Verifica se o evento existe
        const evento = await Evento.findByPk(ID_EVENTO);

        if (!evento) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }

        // Verifica se há vagas disponíveis no evento
        if (evento.N_PARTICIPANTES <= 0) {
            return res.status(400).json({ error: 'Não há vagas disponíveis.' });
        }

        // Cria o registro do participante no evento
        const participante = await ParticipantesEvento.create({ ID_FUNCIONARIO, ID_EVENTO });

        // Reduz o número de participantes disponíveis no evento
        evento.N_PARTICIPANTES -= 1;
        await evento.save();

        const participanteInfo = await User.findByPk(ID_FUNCIONARIO);

        if (!participanteInfo) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        // Envia uma notificação ao criador do evento
        const criadorDoEvento = await User.findByPk(evento.ID_CRIADOR);

        if (criadorDoEvento) {
            const mensagem = `O utilizador ${participanteInfo.user_name} irá participar no seu evento: ${evento.NOME_EVENTO}.`;

            await Notificacoes.create({
                ID_USER: criadorDoEvento.ID_FUNCIONARIO, // ID do criador do evento
                MENSAGEM: mensagem
            });
        }

        res.json(participante);
    } catch (error) {
        console.error('Erro ao inscrever no evento:', error);
        res.status(500).json({ error: 'Erro ao inscrever no evento.' });
    }
};

// Editar participante de um evento
exports.updateParticipante = async (req, res) => {
    const { ID_FUNCIONARIO, ID_EVENTO } = req.params;
    const { newID_FUNCIONARIO, newID_EVENTO } = req.body;

    try {
        const participante = await ParticipantesEvento.findOne({ where: { ID_FUNCIONARIO, ID_EVENTO } });

        if (participante) {
            participante.ID_FUNCIONARIO = newID_FUNCIONARIO || participante.ID_FUNCIONARIO;
            participante.ID_EVENTO = newID_EVENTO || participante.ID_EVENTO;
            await participante.save();
            console.log('Participante atualizado:', participante); // Log de depuração
            res.status(200).json(participante);
        } else {
            res.status(404).json({ error: 'Participante não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao editar participante:', error);
        res.status(500).json({ error: 'Erro ao editar participante.' });
    }
};

// Remover participante de um evento
exports.deleteParticipante = async (req, res) => {
    const { ID_FUNCIONARIO, ID_EVENTO } = req.params;

    try {
        // Verifica se o participante existe no evento
        const participante = await ParticipantesEvento.findOne({ where: { ID_FUNCIONARIO, ID_EVENTO } });

        if (!participante) {
            return res.status(404).json({ error: 'Participante não encontrado.' });
        }

        // Remove o participante do evento
        await participante.destroy();

        // Incrementa o número de participantes disponíveis no evento
        const evento = await Evento.findByPk(ID_EVENTO);
        evento.N_PARTICIPANTES += 1;
        await evento.save();
        const participanteInfo = await User.findByPk(ID_FUNCIONARIO);

        if (!participanteInfo) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }
        // Envia uma notificação ao criador do evento sobre a saída do participante
        const criadorDoEvento = await User.findByPk(evento.ID_CRIADOR);

        if (criadorDoEvento) {
            const mensagem = `O utilizador ${participanteInfo.user_name} deixou de participar do seu evento: ${evento.NOME_EVENTO}.`;

            await Notificacoes.create({
                ID_USER: criadorDoEvento.ID_FUNCIONARIO, // ID do criador do evento
                MENSAGEM: mensagem
            });
        }

        res.json({ message: 'Participação removida com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover participação:', error);
        res.status(500).json({ error: 'Erro ao remover participação.' });
    }
};

exports.listarParticipantesEvento = async (req, res) => {
    const { ID_EVENTO } = req.params;

    try {
        const participantes = await ParticipantesEvento.findAll({
            where: { ID_EVENTO },
            include: [
                {
                    model: User,
                    attributes: ['ID_FUNCIONARIO', 'user_name', 'user_mail']
                }
            ],
            attributes: []
        });

        console.log('Participantes do evento:', participantes); // Log de depuração
        res.status(200).json(participantes);
    } catch (error) {
        console.error('Erro ao listar participantes do evento:', error);
        res.status(500).json({ error: 'Erro ao listar participantes do evento.' });
    }
};

exports.listarEventosFuncionario = async (req, res) => {
    const { ID_FUNCIONARIO } = req.params;

    try {
        const eventos = await ParticipantesEvento.findAll({
            where: { ID_FUNCIONARIO },
            include: [
                { model: Evento }
            ]
        });

        console.log('Eventos do funcionário:', eventos); // Log de depuração
        res.status(200).json(eventos);
    } catch (error) {
        console.error('Erro ao listar eventos do funcionário:', error);
        res.status(500).json({ error: 'Erro ao listar eventos do funcionário.' });
    }
};
