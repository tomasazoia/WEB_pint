const AreaLocal = require('../models/areaLocal');

const arealocalController = {
  async arealocal_list(req, res) {
    try {
      const arealocals = await AreaLocal.findAll();
      res.json(arealocals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar áreas locais.' });
    }
  },

  async arealocal_detail(req, res) {
    try {
      const arealocal = await AreaLocal.findByPk(req.params.id);
      if (arealocal) {
        res.json(arealocal);
      } else {
        res.status(404).json({ message: 'Área local não encontrada.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao obter detalhes da área local.' });
    }
  },

  async arealocal_create(req, res) {
    try {
      const arealocal = await AreaLocal.create(req.body);
      res.json(arealocal);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar área local.' });
    }
  },

  async arealocal_update(req, res) {
    try {
      await AreaLocal.update(req.body, { where: { id: req.params.id } });
      const arealocal = await AreaLocal.findByPk(req.params.id);
      res.json(arealocal);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar área local.' });
    }
  },

  async arealocal_delete(req, res) {
    try {
      await AreaLocal.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Área local excluída com sucesso.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir área local.' });
    }
  },
};

module.exports = arealocalController;
