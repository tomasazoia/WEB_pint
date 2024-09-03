/*const Foto = require('../models/foto');

const fotoController = {
  async foto_list(req, res) {
    try {
      const fotos = await Foto.findAll();
      res.json(fotos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao listar fotos.' });
    }
  },

  async foto_detail(req, res) {
    try {
      const foto = await Foto.findByPk(req.params.id);
      if (foto) {
        res.json(foto);
      } else {
        res.status(404).json({ message: 'Foto não encontrada.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao obter detalhes da foto.' });
    }
  },

  async foto_create(req, res) {
    try {
      const foto = await Foto.create(req.body);
      res.json(foto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar foto.' });
    }
  },

  async foto_update(req, res) {
    try {
      await Foto.update(req.body, { where: { id: req.params.id } });
      const foto = await Foto.findByPk(req.params.id);
      res.json(foto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar foto.' });
    }
  },

  async foto_delete(req, res) {
    try {
      await Foto.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Foto excluída com sucesso.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao excluir foto.' });
    }
  },
};

module.exports = fotoController;*/
