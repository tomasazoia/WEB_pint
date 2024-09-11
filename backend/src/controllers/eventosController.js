const Eventos = require('../models/eventos');
const Centro = require('../models/centro');
const Users = require('../models/users');
const Area = require('../models/area');
const Subarea = require('../models/subArea');
const AlbumFotos = require('../models/albumFotos');
const ComentariosEvento = require('../models/comentarios_evento');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Locais = require('../models/locais');
const { Op } = require('sequelize');
const upload = multer({ dest: 'uploads/' });
const Notificacoes = require('../models/notificacoes');
const userPreferences = require('../models/userPreferences');
const ParticipantesEvento  = require('../models/participantes_evento');
const Sequelize = require('sequelize');

const listEventosByUserCentro = async (req, res) => {
  const { userId } = req.params; // Assumindo que o ID do usuário seja passado como parâmetro

  try {
    // Encontrar o utilizador com base no ID
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }

    // Listar todos os eventos associados ao centro do utilizador
    const eventos = await Eventos.findAll({
      where: {
        ID_CENTRO: centroId,
        DISPONIBILIDADE: false
      },
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }
      ]
    });

    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos do centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar eventos do centro do utilizador.', error: error.message });
  }
};

const createEvento = async (req, res) => {
  try {
    const {
      ID_CRIADOR,
      NOME_EVENTO,
      TIPO_EVENTO,
      DATA_EVENTO,
      DISPONIBILIDADE,
      LOCALIZACAO,
      ID_AREA,
      ID_SUB_AREA,
      N_PARTICIPANTES,
      ID_APROVADOR,
    } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!ID_CRIADOR || !NOME_EVENTO || !TIPO_EVENTO || !DATA_EVENTO) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Encontrar o utilizador com base no ID
    const user = await Users.findByPk(ID_CRIADOR);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const ID_CENTRO = user.ID_CENTRO;

    if (!ID_CENTRO) {
      return res.status(404).json({ error: 'Centro associado ao utilizador não encontrado' });
    }

    const foto = req.file ? req.file.path : null; // Verifica se existe um arquivo de foto

    const novoEvento = await Eventos.create({
      ID_CENTRO,  // Centro obtido automaticamente do utilizador
      ID_CRIADOR,
      NOME_EVENTO,
      TIPO_EVENTO,
      DATA_EVENTO,
      DISPONIBILIDADE,
      LOCALIZACAO,
      ID_AREA,
      ID_SUB_AREA: ID_SUB_AREA || null, // Certifica-se de que será null se não estiver definido
      N_PARTICIPANTES,
      ID_APROVADOR,
      foto
    });

    // Buscar utilizadores que tenham a área ou subárea nas preferências
    const utilizadoresComPreferencias = await userPreferences.findAll({
      where: {
        [Sequelize.Op.or]: [
          { ID_AREA },
          { ID_SUBAREA: ID_SUB_AREA || null}
        ]
      },
      include: [{
        model: Users,
        attributes: ['ID_FUNCIONARIO', 'user_name', 'user_mail']
      }]
    });

    // Criar notificações para esses utilizadores
    const notificacoes = utilizadoresComPreferencias.map(preferencia => ({
      ID_USER: preferencia.ID_USER,
      MENSAGEM: `Um novo evento na sua área de interesse foi criado: ${NOME_EVENTO}`,
      LIDA: false,
      DATA_NOTIFICACAO: new Date()
    }));

    await Notificacoes.bulkCreate(notificacoes); // Criar todas as notificações de uma vez

    res.status(201).json(novoEvento);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};


const createEventoMobile = async (req, res) => {
  try {
    const {
      ID_CENTRO, // Agora recebido no formulário
      ID_CRIADOR,
      NOME_EVENTO,
      TIPO_EVENTO,
      DATA_EVENTO,
      DISPONIBILIDADE,
      LOCALIZACAO,
      ID_AREA,
      ID_SUB_AREA,
      N_PARTICIPANTES,
      ID_APROVADOR,
    } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!ID_CENTRO || !ID_CRIADOR || !NOME_EVENTO || !TIPO_EVENTO || !DATA_EVENTO) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Verifica se o utilizador existe
    const user = await Users.findByPk(ID_CRIADOR);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Verifica se existe um arquivo de foto
    const foto = req.file ? req.file.path : null;

    // Criar o novo evento com o ID_CENTRO fornecido no formulário
    const novoEvento = await Eventos.create({
      ID_CENTRO,  // Centro recebido no formulário
      ID_CRIADOR,
      NOME_EVENTO,
      TIPO_EVENTO,
      DATA_EVENTO,
      DISPONIBILIDADE,
      LOCALIZACAO,
      ID_AREA,
      ID_SUB_AREA: ID_SUB_AREA || null, // Certifica-se de que será null se não estiver definido
      N_PARTICIPANTES,
      ID_APROVADOR,
      foto
    });

    // Buscar utilizadores que tenham a área ou subárea nas preferências
    const utilizadoresComPreferencias = await userPreferences.findAll({
      where: {
        [Sequelize.Op.or]: [
          { ID_AREA },
          { ID_SUBAREA: ID_SUB_AREA || null }
        ]
      },
      include: [{
        model: Users,
        attributes: ['ID_FUNCIONARIO', 'user_name', 'user_mail']
      }]
    });

    // Criar notificações para esses utilizadores
    const notificacoes = utilizadoresComPreferencias.map(preferencia => ({
      ID_USER: preferencia.ID_USER,
      MENSAGEM: `Um novo evento na sua área de interesse foi criado: ${NOME_EVENTO}`,
      LIDA: false,
      DATA_NOTIFICACAO: new Date()
    }));

    await Notificacoes.bulkCreate(notificacoes); // Criar todas as notificações de uma vez

    res.status(201).json(novoEvento);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};



const eventoDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const evento = await Eventos.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }

      ]
    });
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json(evento);
  } catch (err) {
    console.error('Erro ao encontrar detalhes do evento:', err);
    res.status(500).json({ error: 'Erro ao encontrar detalhes do evento' });
  }
};

// Listar todos os eventos
const listEventos = async (req, res) => {
  try {
    const eventos = await Eventos.findAll();

    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos.', error: error.message });
  }
};

const listEventosDispCentroCal = async (req, res) => {
  const { userId } = req.params; // Assumindo que o ID do usuário seja passado como parâmetro

  try {
    // Encontrar o utilizador com base no ID
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }

    // Listar todos os eventos disponíveis associados ao centro do utilizador
    const eventos = await Eventos.findAll({
      where: {
        ID_CENTRO: centroId,
        DISPONIBILIDADE: true
      }
    });

    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos disponíveis no centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar eventos disponíveis no centro do utilizador.', error: error.message });
  }
};

const listEventosDisp = async (req, res) => {
  try {
    const eventos = await Eventos.findAll({
      where: {
        DISPONIBILIDADE: true
      },
      attributes: [
        'ID_EVENTO',
        'ID_CENTRO',
        'ID_CRIADOR',
        'NOME_EVENTO',
        'TIPO_EVENTO',
        'DATA_EVENTO',
        'DISPONIBILIDADE',
        'LOCALIZACAO',
        'ID_AREA',
        'ID_SUB_AREA',
        'N_PARTICIPANTES',
        'foto'
      ],
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }
      ]
    });

    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ message: 'Erro ao listar eventos.', error: error.message });
  }
};

const listEventosDispCentro = async (req, res) => {
  const { userId } = req.params; // Assumindo que o ID do usuário seja passado como parâmetro

  try {
    // Encontrar o utilizador com base no ID
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }
    const currentDate = new Date();

    // Listar todos os eventos disponíveis associados ao centro do utilizador
    const eventos = await Eventos.findAll({
      where: {
        ID_CENTRO: centroId,
        DISPONIBILIDADE: true,
      },
      attributes: [
        'ID_EVENTO',
        'ID_CENTRO',
        'ID_CRIADOR',
        'NOME_EVENTO',
        'TIPO_EVENTO',
        'DATA_EVENTO',
        'DISPONIBILIDADE',
        'LOCALIZACAO',
        'ID_AREA',
        'ID_SUB_AREA',
        'N_PARTICIPANTES',
        'foto'
      ],
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }
      ]
    });

    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos disponíveis no centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar eventos disponíveis no centro do utilizador.', error: error.message });
  }
};

const listEventosByArea = async (req, res) => {
  const { id } = req.params; // Obter o ID da área a partir dos parâmetros da rota

  try {
    // Verificar se o ID_AREA foi fornecido
    if (!id) {
      return res.status(400).json({ message: 'ID_AREA não fornecido.' });
    }

    // Listar todos os eventos associados à ID_AREA
    const eventos = await Eventos.findAll({
      where: {
        ID_AREA: id,
        DISPONIBILIDADE: true
      },
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }
      ]
    });

    // Verificar se foram encontrados eventos
    if (!eventos.length) {
      return res.status(404).json({ message: 'Nenhum evento encontrado para esta área.' });
    }

    // Retornar os eventos encontrados
    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos por área:', error);
    res.status(500).json({ message: 'Erro ao listar eventos por área.', error: error.message });
  }
};

// Atualizar um evento
const updateEvento = async (req, res) => {
  const eventoId = req.params.id;
  const {
      NOME_EVENTO,
      TIPO_EVENTO,
      DATA_EVENTO,
      LOCALIZACAO,
      N_PARTICIPANTES,
      DISPONIBILIDADE,
      ID_CENTRO,
      ID_CRIADOR,
      ID_AREA,
      ID_SUB_AREA, // Recebendo campo como string ou null
  } = req.body;
  const foto = req.file ? req.file.path : null;

  try {
      let evento = await Eventos.findByPk(eventoId);

      if (!evento) {
          return res.status(404).json({ message: 'Evento não encontrado.' });
      }

      evento.NOME_EVENTO = NOME_EVENTO || evento.NOME_EVENTO;
      evento.TIPO_EVENTO = TIPO_EVENTO || evento.TIPO_EVENTO;
      evento.DATA_EVENTO = DATA_EVENTO || evento.DATA_EVENTO;
      evento.LOCALIZACAO = LOCALIZACAO || evento.LOCALIZACAO;
      evento.N_PARTICIPANTES = N_PARTICIPANTES || evento.N_PARTICIPANTES;
      if (typeof DISPONIBILIDADE !== 'undefined') {
          evento.DISPONIBILIDADE = DISPONIBILIDADE;
      }

      if (ID_CENTRO) {
          evento.ID_CENTRO = ID_CENTRO;
      }
      if (ID_CRIADOR) {
          evento.ID_CRIADOR = ID_CRIADOR;
      }
      if (ID_AREA) {
          evento.ID_AREA = ID_AREA;
      }

      // Se ID_SUB_AREA for uma string vazia, defina-o como null
      evento.ID_SUB_AREA = ID_SUB_AREA === '' ? null : ID_SUB_AREA;

      if (foto) {
          if (evento.foto) {
              fs.unlink(path.join(__dirname, '..', evento.foto), (err) => {
                  if (err) console.error('Erro ao deletar foto antiga:', err);
              });
          }
          evento.foto = foto;
      }


      // Buscar os participantes do evento
    const participantes = await ParticipantesEvento.findAll({
      where: { ID_EVENTO: eventoId },
      include: [{
        model: Users,
        attributes: ['ID_FUNCIONARIO', 'user_name', 'user_mail']
      }]
    });

    // Criar notificações para os participantes
    const notificacoes = participantes.map(participante => ({
      ID_USER: participante.User.ID_FUNCIONARIO,
      MENSAGEM: `O evento ${evento.NOME_EVENTO} foi atualizado. Verifique as novas informações.`,
      LIDA: false
    }));

    await Notificacoes.bulkCreate(notificacoes);

    await evento.save();

      res.status(200).json({ message: 'Evento atualizado com sucesso.', evento });
  } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      res.status(500).json({ message: 'Erro ao atualizar evento.', error: error.message });
  }
};

// Deletar um evento
const deleteEvento = async (req, res) => {
  const eventoId = req.params.id;

  try {
    const evento = await Eventos.findByPk(eventoId);

    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    // Buscar os participantes do evento
    const participantes = await ParticipantesEvento.findAll({
      where: { ID_EVENTO: eventoId },
      include: [{
        model: Users,
        attributes: ['ID_FUNCIONARIO', 'user_name', 'user_mail']
      }]
    });

    const notificacoes = participantes.map(participante => ({
      ID_USER: participante.User.ID_FUNCIONARIO,
      MENSAGEM: `O evento ${evento.NOME_EVENTO} no qual participava foi eliminado, contacte o criador do evento para mais informações.`,
      LIDA: false
    }));

    await Notificacoes.bulkCreate(notificacoes);

    await evento.destroy();

    res.status(200).json({ message: 'Evento eliminado com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar evento:', error);
    res.status(500).json({ message: 'Erro ao eliminar evento.', error: error.message });
  }
};

const listarEventosCriador = async (req, res) => {
  const { ID_CRIADOR } = req.params;

  try {
    const eventos = await Eventos.findAll({
      where: {
        ID_CRIADOR
      }
    });

    // Sempre retornar um array, mesmo que vazio
    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos do criador:', error);
    res.status(500).json({ message: 'Erro ao listar eventos do criador.', error: error.message });
  }
};

// Controller de Eventos
const listEventosBySubArea = async (req, res) => {
  const { subAreaId } = req.params;
  const { userId } = req.params;

  try {
    const user = await Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }

    const eventos = await Eventos.findAll({
      where: {
        ID_CENTRO: centroId,
        ID_SUB_AREA: subAreaId
      },
      include: [
        {
          model: Users,
          as: 'User', // Alias utilizado na associação
          attributes: ['user_name'] // Apenas os atributos que deseja retornar
        },
        {
          model: Area,
          as: 'area', // Alias utilizado na associação
          attributes: ['NOME_AREA']
        },
        {
          model: Centro,
          as: 'centro', // Alias utilizado na associação
          attributes: ['NOME_CENTRO']
        },
        {
          model: Subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }
      ]
    });

    if (eventos.length === 0) {
      return res.status(404).json({ message: 'Nenhum evento encontrado para esta subárea.' });
    }

    return res.status(200).json(eventos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar eventos por subárea.' });
  }
};
const eventos_por_area = async (req, res) => {
  try {
    const eventosCount = await Eventos.findAll({
      attributes: [
        [Sequelize.col('area.NOME_AREA'), 'area_name'],
        [Sequelize.fn('COUNT', Sequelize.col('eventos.ID_EVENTO')), 'event_count']
      ],
      include: [{
        model: Area,
        attributes: [],
      }],
      group: ['area.NOME_AREA']
    });

    // Garantir que eventosCount seja um array, mesmo que vazio
    res.json(eventosCount || []);
  } catch (error) {
    console.error('Error fetching events by area:', error);
    res.status(500).send('Internal Server Error');
  }
};
const invalidateEvento = async (req, res) => {
  const { id } = req.params; // ID do local passado como parâmetro na URL

  try {
    // Encontrar o local pelo ID
    const evento = await Eventos.findByPk(id);

    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    // Atualizar o campo VALIDAR para true
    evento.DISPONIBILIDADE = false;

    // Salvar as alterações no banco de dados
    await evento.save();

    res.status(200).json({ message: 'Evento validado com sucesso.', evento });
  } catch (error) {
    console.error('Erro ao validar evento:', error);
    res.status(500).json({ message: 'Erro ao validar evento.', error: error.message });
  }
};
module.exports = { listEventosByUserCentro, createEvento, createEventoMobile, listEventos, listEventosDispCentroCal, updateEvento, deleteEvento, eventoDetail, listEventosDisp, listEventosDispCentro, listEventosByArea, listarEventosCriador,listEventosBySubArea,eventos_por_area,invalidateEvento };