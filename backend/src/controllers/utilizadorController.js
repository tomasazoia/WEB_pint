const User = require('../models/users');
const Centro = require('../models/centro');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Adicionando bcrypt para criptografar a nova palavra-passe
const { Sequelize } = require('sequelize');
const Forum = require('../models/forum');
const ComentariosForum = require('../models/comentarios_forum');
const config = require('../config');

// Função para listar todos os utilizadores
const listarUsers = async (req, res) => {
  try {
    const utilizadores = await User.findAll();
    res.status(200).json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar utilizadores.', error: error.message });
  }
};

// Função para listar utilizadores validados
const listarUsersValidados = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }

    const utilizadores = await User.findAll({
      where: {
        ID_CENTRO: centroId,
        VALIDAR: true
      }
    });
    res.status(200).json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar utilizadores.', error: error.message });
  }
};

// Função para listar utilizadores não validados
const listarUsersNaoValidados = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const centroId = user.ID_CENTRO;

    if (!centroId) {
      return res.status(404).json({ message: 'Centro do utilizador não encontrado.' });
    }

    const utilizadores = await User.findAll({
      where: {
        ID_CENTRO: centroId,
        VALIDAR: false
      }
    });
    res.status(200).json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizador:', error);
    res.status(500).json({ message: 'Erro ao listar utilizadores.', error: error.message });
  }
};

// Função para obter o utilizador logado
const getLoggedUser = async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, config.SECRET_KEY);
    const userId = decoded.user_id;

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'utilizador não encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao obter o utilizador logado:', error);
    res.status(500).json({ message: 'Erro ao obter o utilizador logado.', error: error.message });
  }
};

// Função para atualizar os dados do utilizador
const updateUser = async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, config.SECRET_KEY);
    const userId = decoded.user_id;

    const { user_name, user_mail, NIF, MORADA, NTELEMOVEL } = req.body;

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'utilizador não encontrado.' });
    }

    user.user_name = user_name || user.user_name;
    user.user_mail = user_mail || user.user_mail;
    user.NIF = NIF || user.NIF;
    user.MORADA = MORADA || user.MORADA;
    user.NTELEMOVEL = NTELEMOVEL || user.NTELEMOVEL;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao atualizar os dados do utilizador:', error);
    res.status(500).json({ message: 'Erro ao atualizar os dados do utilizador.', error: error.message });
  }
};

// Função para deletar um utilizador
const deleteUser = async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, config.SECRET_KEY);
    const userId = req.params.id;

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'utilizador não encontrado.' });
    }

    const funcionarioId = user.ID_FUNCIONARIO;

    const forums = await Forum.findAll({ where: { ID_CRIADOR: funcionarioId } });
    const forumIds = forums.map(forum => forum.ID_FORUM);

    await ComentariosForum.destroy({ where: { ID_FORUM: forumIds } });

    await Forum.destroy({ where: { ID_CRIADOR: funcionarioId } });

    await user.destroy();

    res.status(200).json({ message: 'utilizador deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar o utilizador:', error);
    res.status(500).json({ message: 'Erro ao deletar o utilizador.', error: error.message });
  }
};

// Função para listar utilizadores por centro
const listarUsersPorCentro = async (req, res) => {
  try {
    const usersByCenter = await User.findAll({
      attributes: [
        [Sequelize.col('centro.NOME_CENTRO'), 'centro_nome'],
        [Sequelize.fn('COUNT', Sequelize.col('User.ID_FUNCIONARIO')), 'user_count']
      ],
      include: [{
        model: Centro,
        attributes: []
      }],
      group: ['centro.NOME_CENTRO']
    });

    res.status(200).json(usersByCenter);
  } catch (error) {
    console.error('Erro ao listar utilizadores por centro:', error);
    res.status(500).json({ message: 'Erro ao listar utilizadores por centro.', error: error.message });
  }
};

// Função para listar utilizadores por data de início
const listarUsersByStartDate = async (req, res) => {
  try {
    const usersByStartDate = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('DATAINICIO')), 'start_date'],
        [Sequelize.fn('COUNT', Sequelize.col('ID_FUNCIONARIO')), 'user_count']
      ],
      group: ['start_date'],
      order: [['start_date', 'ASC']]
    });

    res.status(200).json(usersByStartDate);
  } catch (error) {
    console.error('Erro ao listar utilizadores por data de início:', error);
    res.status(500).json({ message: 'Erro ao listar utilizadores por data de início.', error: error.message });
  }
};

// Função para obter um utilizador por ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID do utilizador não fornecido.' });
    }

    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ message: 'ID do utilizador inválido.' });
    }

    const user = await User.findOne({ where: { ID_FUNCIONARIO: userId } });

    if (!user) {
      return res.status(404).json({ message: 'utilizador não encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao obter utilizador por ID:', error);
    res.status(500).json({ message: 'Erro ao obter utilizador por ID.', error: error.message });
  }
};

// Função para validar um utilizador
const validarUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID do utilizador não fornecido.' });
    }

    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ message: 'ID do utilizador inválido.' });
    }

    const user = await User.findOne({ where: { ID_FUNCIONARIO: userId } });

    if (!user) {
      return res.status(404).json({ message: 'utilizador não encontrado.' });
    }

    user.VALIDAR = true;
    await user.save();

    res.status(200).json({ message: 'Utilizador validado com sucesso.', user });
  } catch (error) {
    console.error('Erro ao validar utilizador:', error);
    res.status(500).json({ message: 'Erro ao validar utilizador.', error: error.message });
  }
};

// Função para invalidar um utilizador
const invalidarUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID do utilizador não fornecido.' });
    }

    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ message: 'ID do utilizador inválido.' });
    }

    const user = await User.findOne({ where: { ID_FUNCIONARIO: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    user.VALIDAR = false;
    await user.save();

    res.status(200).json({ message: 'Utilizador invalidado com sucesso.', user });
  } catch (error) {
    console.error('Erro ao invalidar utilizador:', error);
    res.status(500).json({ message: 'Erro ao invalidar utilizador.', error: error.message });
  }
};

// Função para alterar a palavra-passe do utilizador
const changePassword = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const { oldPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, config.SECRET_KEY);
    const userId = decoded.user_id;

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'palavra-passe antiga incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'palavra-passe alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao alterar a palavra-passe do utilizador:', error);
    res.status(500).json({ message: 'Erro ao alterar a palavra-passe do utilizador.', error: error.message });
  }
};

// Função para atualizar o centro do utilizador
const updateUserCentro = async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, config.SECRET_KEY);
    const userId = decoded.user_id;

    const { ID_CENTRO } = req.body;

    if (!ID_CENTRO) {
      return res.status(400).json({ message: 'ID do Centro não fornecido.' });
    }

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const centro = await Centro.findOne({ where: { ID_CENTRO: ID_CENTRO } });

    if (!centro) {
      return res.status(404).json({ message: 'Centro não encontrado.' });
    }

    user.ID_CENTRO = ID_CENTRO;

    await user.save();

    res.status(200).json({ message: 'Centro atualizado com sucesso.', user });
  } catch (error) {
    console.error('Erro ao atualizar o centro do utilizador:', error);
    res.status(500).json({ message: 'Erro ao atualizar o centro do utilizador.', error: error.message });
  }
};

const promoverParaAdministrador = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID do utilizador não fornecido.' });
    }

    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ message: 'ID do utilizador inválido.' });
    }

    const user = await User.findOne({ where: { ID_FUNCIONARIO: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    user.ADMINISTRADOR = true;
    user.VALIDAR = true;
    await user.save();

    res.status(200).json({ message: 'Utilizador promovido para administrador com sucesso.', user });
  } catch (error) {
    console.error('Erro ao promover utilizador para administrador:', error);
    res.status(500).json({ message: 'Erro ao promover utilizador para administrador.', error: error.message });
  }
};

const despromoverParaAdministrador = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'ID do utilizador não fornecido.' });
    }

    if (!Number.isInteger(parseInt(userId))) {
      return res.status(400).json({ message: 'ID do utilizador inválido.' });
    }

    const user = await User.findOne({ where: { ID_FUNCIONARIO: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    user.ADMINISTRADOR = false;
    await user.save();

    res.status(200).json({ message: 'Utilizador promovido para administrador com sucesso.', user });
  } catch (error) {
    console.error('Erro ao promover utilizador para administrador:', error);
    res.status(500).json({ message: 'Erro ao promover utilizador para administrador.', error: error.message });
  }
};

const deleteUser1 = async (req, res) => {
  const { id } = req.params;

  try {

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User não encontrado' });
    }

    await user.destroy();
    res.status(200).json({ message: 'utilizador deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar o utilizador:', error);
    res.status(500).json({ message: 'Erro ao deletar o utilizador.', error: error.message });
  }
};

module.exports = {
  listarUsers,
  listarUsersValidados,
  listarUsersNaoValidados,
  getLoggedUser,
  updateUser,
  deleteUser,
  listarUsersPorCentro,
  listarUsersByStartDate,
  getUserById,
  validarUser,
  updateUserCentro,
  invalidarUser,
  promoverParaAdministrador,
  despromoverParaAdministrador,
  deleteUser1
};
