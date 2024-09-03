const Centro = require('../models/centro'); 

const createCentro = async (req, res) => {
  const { NOME_CENTRO, MORADA, N_EVENTOS } = req.body;

  if (!NOME_CENTRO || !MORADA) {
    return res.status(400).json({ message: 'Nome do centro e morada são obrigatórios.' });
  }

  try {
    const newCentro = await Centro.create({
      NOME_CENTRO,
      MORADA,
      N_EVENTOS: N_EVENTOS || 0 // Default para 0 se não fornecido
    });

    res.status(201).json({ message: 'Centro criado com sucesso.', centro: newCentro });
  } catch (error) {
    console.error('Erro ao criar centro:', error);
    res.status(500).json({ message: 'Erro ao criar centro.', error: error.message });
  }
};

const listCentros = async (req, res) => {
  try {
    const centros = await Centro.findAll();

    res.status(200).json(centros);
  } catch (error) {
    console.error('Erro ao listar centros:', error);
    res.status(500).json({ message: 'Erro ao listar centros.', error: error.message });
  }
};

const updateCentro = async (req, res) => {
  const centroId = req.params.id;
  const { NOME_CENTRO, MORADA, N_EVENTOS } = req.body;

  try {
    let centro = await Centro.findByPk(centroId);

    if (!centro) {
      return res.status(404).json({ message: 'Centro não encontrado.' });
    }

    // Atualiza apenas os campos que foram enviados na requisição
    centro.NOME_CENTRO = NOME_CENTRO || centro.NOME_CENTRO;
    centro.MORADA = MORADA || centro.MORADA;
    centro.N_EVENTOS = N_EVENTOS || centro.N_EVENTOS;

    await centro.save();

    res.status(200).json({ message: 'Centro atualizado com sucesso.', centro });
  } catch (error) {
    console.error('Erro ao atualizar centro:', error);
    res.status(500).json({ message: 'Erro ao atualizar centro.', error: error.message });
  }
};

const deleteCentro = async (req, res) => {
  const centroId = req.params.id;

  try {
    const centro = await Centro.findByPk(centroId);

    if (!centro) {
      return res.status(404).json({ message: 'Centro não encontrado.' });
    }

    await centro.destroy();

    res.status(200).json({ message: 'Centro eliminado com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar centro:', error);
    res.status(500).json({ message: 'Erro ao eliminar centro.', error: error.message });
  }
};

module.exports = { createCentro, listCentros, updateCentro, deleteCentro };
