const AlbumFotos = require('../models/albumFotos');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
const Users = require('../models/users');
const upload = multer({ dest: 'uploads/' });

const addAlbum = async (req, res) => {
  try {
    const {
      ID_EVENTO,
      LEGENDA,
      ID_CRIADOR
    } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!ID_EVENTO || !LEGENDA || !ID_CRIADOR) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Encontrar o utilizador com base no ID
    const user = await Users.findByPk(ID_CRIADOR);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Verificar se o arquivo de foto foi fornecido
    const foto = req.file ? req.file.path : null;
    if (!foto) {
      return res.status(400).json({ error: 'Foto não fornecida' });
    }

    const DATA_ADICAO = req.body.DATA_ADICAO || new Date();

    // Cria o álbum de fotos no banco de dados
    const album = await AlbumFotos.create({
      foto,
      ID_EVENTO,
      LEGENDA,
      ID_CRIADOR,
      DATA_ADICAO
    });

    // Responde com sucesso
    res.status(201).json(album);
  } catch (error) {
    console.error('Erro ao criar álbum de fotos:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao criar o álbum de fotos.' });
  }
};

const listarAlbums = async (req, res) => {
  try {
    const albums = await AlbumFotos.findAll();
    const fotos = albums.map(album => album.foto);

    res.status(200).json(fotos);
  } catch (error) {
    console.error('Erro ao listar álbuns de fotos:', error);
    res.status(500).json({ message: 'Erro ao listar álbuns de fotos.', error: error.message });
  }
};


const albumDoEvento = async (req, res) => {
  const { id } = req.params;

  try {
    const album = await AlbumFotos.findAll({
      where: {
        ID_EVENTO: id
      }
    });

    if (!album) {
      return res.status(404).json({ message: 'Álbum de fotos não encontrado para o evento especificado.' });
    }

    res.status(200).json(album);
  } catch (error) {
    console.error('Erro ao recuperar álbum de fotos do evento:', error);
    res.status(500).json({ message: 'Erro ao recuperar álbum de fotos do evento.', error: error.message });
  }
};

const deleteFoto = async (req, res) => {
  const { id } = req.params;

  try {
    const foto = await AlbumFotos.findByPk(id);

    if (!foto) {
      return res.status(404).json({ message: 'Foto não encontrada.' });
    }
    
    const filePath = path.join('uploads', foto.foto);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Erro ao deletar o arquivo:', err);
          return res.status(500).json({ error: 'Erro ao deletar o arquivo físico.' });
        }
      });
    }

    await AlbumFotos.destroy({ where: { ID_FOTO: id } });

    res.status(200).json({ message: 'Foto deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao deletar a foto.' });
  }
};



module.exports = {
  addAlbum,
  listarAlbums,
  albumDoEvento,
  deleteFoto
};