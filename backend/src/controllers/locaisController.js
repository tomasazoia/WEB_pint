const Locais = require('../models/locais');
const Area = require('../models/area');
const multer = require('multer');
const path = require('path');
const Sequelize = require('sequelize');
const Centro = require('../models/centro');
const Users = require('../models/users');
const upload = multer({ dest: 'uploads/' });
const subarea = require('../models/subArea');
const Notificacoes = require('../models/notificacoes');
const userPreferences = require('../models/userPreferences');
const { Storage } = require('@google-cloud/storage');

// Função para criar um novo local
const createLocal = async (req, res) => {
  try {
    const {
      ID_CRIADOR,
      ID_AREA,
      ID_SUB_AREA,
      DESIGNACAO_LOCAL,
      LOCALIZACAO,
      REVIEW,
      PRECO
    } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!ID_CRIADOR || !ID_AREA || !DESIGNACAO_LOCAL || !LOCALIZACAO || !PRECO) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Encontrar o utilizador com base no ID_CRIADOR
    const user = await Users.findByPk(ID_CRIADOR);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Recuperar o ID do centro associado ao utilizador
    const ID_CENTRO = user.ID_CENTRO;

    if (!ID_CENTRO) {
      return res.status(404).json({ error: 'Centro associado ao utilizador não encontrado' });
    }

    // Verificar se o arquivo de foto foi enviado
    const foto = req.file ? req.file.path : null;

    // Criar o novo local
    const novoLocal = await Locais.create({
      ID_CENTRO,  // Centro obtido automaticamente do utilizador
      ID_CRIADOR,
      ID_AREA,
      ID_SUB_AREA: ID_SUB_AREA || null, // Certifica-se de que será null se não estiver definido
      DESIGNACAO_LOCAL,
      LOCALIZACAO,
      REVIEW,
      PRECO,
      foto
    });
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
      MENSAGEM: `Um novo local na sua área de interesse foi criado: ${DESIGNACAO_LOCAL}`,
      LIDA: false,
      DATA_NOTIFICACAO: new Date()
    }));

    await Notificacoes.bulkCreate(notificacoes);
    // Retornar resposta com sucesso e os dados do local criado
    res.status(201).json(novoLocal);
  } catch (error) {
    console.error('Erro ao criar local:', error);
    res.status(500).json({ error: 'Erro ao criar local' });
  }
};

// Função para criar um novo local
const createLocalMobile = async (req, res) => {
  try {
    const {
      ID_CENTRO, // Agora recebido no formulário
      ID_CRIADOR,
      ID_AREA,
      ID_SUB_AREA,
      DESIGNACAO_LOCAL,
      LOCALIZACAO,
      REVIEW,
      PRECO
    } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!ID_CENTRO || !ID_CRIADOR || !ID_AREA || !DESIGNACAO_LOCAL || !LOCALIZACAO || !PRECO) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Verifica se o utilizador existe
    const user = await Users.findByPk(ID_CRIADOR);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Verifica se o arquivo de foto foi enviado
    const foto = req.file ? req.file.path : null;

    // Criar o novo local com o ID_CENTRO fornecido no formulário
    const novoLocal = await Locais.create({
      ID_CENTRO,  // Centro recebido no formulário
      ID_CRIADOR,
      ID_AREA,
      ID_SUB_AREA: ID_SUB_AREA || null, // Certifica-se de que será null se não estiver definido
      DESIGNACAO_LOCAL,
      LOCALIZACAO,
      REVIEW,
      PRECO,
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
      MENSAGEM: `Um novo local na sua área de interesse foi criado: ${DESIGNACAO_LOCAL}`,
      LIDA: false,
      DATA_NOTIFICACAO: new Date()
    }));

    await Notificacoes.bulkCreate(notificacoes); // Criar todas as notificações de uma vez

    // Retornar resposta com sucesso e os dados do local criado
    res.status(201).json(novoLocal);
  } catch (error) {
    console.error('Erro ao criar local:', error);
    res.status(500).json({ error: 'Erro ao criar local' });
  }
};


const listLocaisByUserCentro = async (req, res) => {
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

    // Listar todos os locais associados ao centro do utilizador
    const locais = await Locais.findAll({
      where: {
        ID_CENTRO: centroId,
        VALIDAR: true
      },
      include: [
        {
          model: Area,
          attributes: ['NOME_AREA']
        },
        {
          model: subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }]
    });

    // Adicionar a URL da foto para cada local
    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    console.error('Erro ao listar locais do centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar locais do centro do utilizador.', error: error.message });
  }
};

const listLocaisByUserCentroInvalid = async (req, res) => {
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

    // Listar todos os locais associados ao centro do utilizador
    const locais = await Locais.findAll({
      where: {
        ID_CENTRO: centroId,
        VALIDAR: false
      },
      include: [
        {
          model: Area,
          attributes: ['NOME_AREA']
        },
        {
          model: subarea,
          as: 'sub_area',
          attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
        }]
    });

    // Adicionar a URL da foto para cada local
    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    console.error('Erro ao listar locais do centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar locais do centro do utilizador.', error: error.message });
  }
};

// Função para listar todos os locais
const listLocais = async (req, res) => {
  try {
    // Buscar apenas os locais associados ao ID_CENTRO do usuário logado
    const locais = await Locais.findAll({
      include: [{
        model: Area,
        attributes: ['NOME_AREA']
      },
      {
        model: subarea,
        as: 'sub_area',
        attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
      }

      ]
    });

    // Adicionar URL da foto a cada local
    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    return res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    console.error('Erro ao listar os locais:', error);
    return res.status(500).json({ error: 'Erro ao listar os locais' });
  }
};

// Função para listar todos os locais validados
const listLocaisValidados = async (req, res) => {
  try {
    // Buscar apenas os locais associados ao ID_CENTRO do usuário logado
    const locais = await Locais.findAll({
      where: {
        VALIDAR: true
      },
      include: [{
        model: Area,
        attributes: ['NOME_AREA']
      },
      {
        model: subarea,
        as: 'sub_area',
        attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
      }

      ]
    });

    // Adicionar URL da foto a cada local
    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    return res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    console.error('Erro ao listar os locais:', error);
    return res.status(500).json({ error: 'Erro ao listar os locais' });
  }
};

// Função para listar locais por área
const listLocaisByArea = async (req, res) => {
  const { id } = req.params;
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

    const locais = await Locais.findAll({
      where: {
        ID_AREA: id,
        ID_CENTRO: centroId,
      },
      include: [{
        model: Area,
        attributes: ['NOME_AREA']
      },
      {
        model: subarea,
        as: 'sub_area',
        attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
      }
      ]
    });

    if (locais.length === 0) {
      return res.status(404).json({ error: 'Nenhum local encontrado para esta área' });
    }

    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    return res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar os locais por área' });
  }
};

// Função para listar locais validados por área
const listLocaisByArea_ = async (req, res) => {
  const { id } = req.params;

  try {
    const locais = await Locais.findAll({
      where: {
        ID_AREA: id,
        VALIDAR: true,
      },
      include: [{
        model: Area,
        attributes: ['NOME_AREA']
      }]
    });

    if (locais.length === 0) {
      return res.status(404).json({ error: 'Nenhum local encontrado para esta área' });
    }

    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    return res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar os locais por área' });
  }
};

const listLocaisBySubArea = async (req, res) => {
  const { id } = req.params;
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

    const locais = await Locais.findAll({
      where: {
        ID_SUB_AREA: id,
        ID_CENTRO: centroId,
      },
      include: [{
        model: subarea,  // Alteração de Area para SubArea
        as: 'sub_area',  // Relacionamento para a subárea
        attributes: ['NOME_SUBAREA']
      },
      {
        model: Area,  // Incluindo a área pai para fornecer contexto
        attributes: ['NOME_AREA']
      }
      ]
    });

    if (locais.length === 0) {
      return res.status(404).json({ error: 'Nenhum local encontrado para esta subárea' });
    }

    const locaisComFotoUrl = locais.map(local => {
      return {
        ...local.dataValues,
        fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
      };
    });

    return res.status(200).json(locaisComFotoUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar os locais por subárea' });
  }
};


// Função para obter detalhes de um local por ID
const getLocalById = async (req, res) => {
  const { id } = req.params;

  try {
    const local = await Locais.findByPk(id, {
      include: [{
        model: Area,
        attributes: ['NOME_AREA'],
      },
      {
        model: subarea,
        as: 'sub_area',
        attributes: ['ID_SUB_AREA', 'NOME_SUBAREA']
      }
      ]
    });

    if (!local) {
      return res.status(404).json({ error: 'Local não encontrado' });
    }

    const localComFotoUrl = {
      ...local.dataValues,
      fotoUrl: local.foto ? `${req.protocol}://${req.get('host')}/uploads/${local.foto}` : null
    };

    return res.status(200).json(localComFotoUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter os detalhes do local' });
  }
};




// Função para editar um local por ID
const updateLocal = [
  upload.single('foto'),
  async (req, res) => {
    const { id } = req.params;
    const { ID_AREA, ID_SUB_AREA, DESIGNACAO_LOCAL, LOCALIZACAO, REVIEW, PRECO } = req.body;
    const foto = req.file ? req.file.path : null;

    try {
      const local = await Locais.findByPk(id);
      if (!local) {
        return res.status(404).json({ error: 'Local não encontrado' });
      }

      const updates = {};
      
      if (ID_AREA) updates.ID_AREA = ID_AREA;
      
      // Se ID_SUB_AREA for uma string vazia ou indefinida, defina-o como null
      updates.ID_SUB_AREA = ID_SUB_AREA === '' || ID_SUB_AREA === undefined ? null : ID_SUB_AREA;

      if (DESIGNACAO_LOCAL) updates.DESIGNACAO_LOCAL = DESIGNACAO_LOCAL;
      if (LOCALIZACAO) updates.LOCALIZACAO = LOCALIZACAO;
      if (REVIEW) updates.REVIEW = REVIEW;
      if (PRECO) updates.PRECO = PRECO;

      if (foto) {
        if (local.foto) {
          fs.unlink(path.join(__dirname, '..', local.foto), (err) => {
            if (err) console.error('Erro ao deletar foto antiga:', err);
          });
        }
        updates.foto = foto;
      }

      await local.update(updates);
      res.json(local);
    } catch (err) {
      console.error('Erro ao atualizar local:', err);
      res.status(500).json({ error: 'Erro ao atualizar local' });
    }
  }
];


// Função para deletar um local por ID
const deleteLocal = async (req, res) => {
  const { id } = req.params;

  try {
    const local = await Locais.findByPk(id);
    if (!local) {
      return res.status(404).json({ error: 'Local não encontrado' });
    }

    await local.destroy();
    return res.status(200).json({ message: 'Local deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar o local' });
  }
};

const locais_por_area = async (req, res) => {
  try {
    const locaisCount = await Locais.findAll({
      attributes: [
        [Sequelize.col('area.NOME_AREA'), 'area_name'],
        [Sequelize.fn('COUNT', Sequelize.col('locais.ID_LOCAL')), 'local_count']
      ],
      include: [{
        model: Area,
        attributes: [],
      }],
      group: ['area.NOME_AREA']
    });

    // Garantir que locaisCount seja um array, mesmo que vazio
    res.json(locaisCount || []);
  } catch (error) {
    console.error('Error fetching locals by area:', error);
    res.status(500).send('Internal Server Error');
  }
};

const validateLocal = async (req, res) => {
  const { id } = req.params; // ID do local passado como parâmetro na URL

  try {
    // Encontrar o local pelo ID
    const local = await Locais.findByPk(id);

    if (!local) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    // Atualizar o campo VALIDAR para true
    local.VALIDAR = true;

    // Salvar as alterações no banco de dados
    await local.save();

    res.status(200).json({ message: 'Local validado com sucesso.', local });
  } catch (error) {
    console.error('Erro ao validar local:', error);
    res.status(500).json({ message: 'Erro ao validar local.', error: error.message });
  }
};

const invalidateLocal = async (req, res) => {
  const { id } = req.params; // ID do local passado como parâmetro na URL

  try {
    // Encontrar o local pelo ID
    const local = await Locais.findByPk(id);

    if (!local) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    // Atualizar o campo VALIDAR para true
    local.VALIDAR = false;

    // Salvar as alterações no banco de dados
    await local.save();

    res.status(200).json({ message: 'Local validado com sucesso.', local });
  } catch (error) {
    console.error('Erro ao validar local:', error);
    res.status(500).json({ message: 'Erro ao validar local.', error: error.message });
  }
};

module.exports = {
  createLocal,
  createLocalMobile,
  listLocaisByUserCentro,
  listLocaisByUserCentroInvalid,
  listLocais,
  listLocaisValidados,
  getLocalById,
  updateLocal,
  deleteLocal,
  listLocaisByArea,
  listLocaisByArea_,
  listLocaisBySubArea,
  locais_por_area,
  validateLocal,
  invalidateLocal
};