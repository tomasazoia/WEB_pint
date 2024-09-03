const SubArea = require('../models/subArea'); // Caminho para o model SubArea
const Area = require('../models/area'); // Caminho para o model Area

// Create a new SubArea
const createSubArea = async (req, res) => {
    const { ID_AREA, NOME_SUBAREA } = req.body;

    if (!ID_AREA || !NOME_SUBAREA) {
        return res.status(400).json({ error: 'ID_AREA e NOME_SUBAREA são obrigatórios' });
    }

    try {
        const newSubArea = await SubArea.create({ ID_AREA, NOME_SUBAREA });
        return res.status(201).json(newSubArea);
    } catch (error) {
        console.error('Erro ao criar SubArea:', error);
        return res.status(500).json({ error: 'Erro ao criar SubArea' });
    }
};

// Get all SubAreas
const getAllSubAreas = async (req, res) => {
    try {
        const subAreas = await SubArea.findAll({
            include: [
                {
                    model: Area,
                    as: 'area', // Alias utilizado na associação
                    attributes: ['NOME_AREA']
                }
            ]
        });
        return res.status(200).json(subAreas);
    } catch (error) {
        console.error('Erro ao buscar SubAreas:', error);
        return res.status(500).json({ error: 'Erro ao buscar SubAreas' });
    }
};

// Get a single SubArea by ID
const getSubAreaById = async (req, res) => {
    const { id } = req.params;

    try {
        const subArea = await SubArea.findByPk(id, { include: Area });
        if (!subArea) {
            return res.status(404).json({ error: 'SubArea não encontrada' });
        }
        return res.status(200).json(subArea);
    } catch (error) {
        console.error('Erro ao buscar SubArea:', error);
        return res.status(500).json({ error: 'Erro ao buscar SubArea' });
    }
};

// Update a SubArea by ID
const updateSubArea = async (req, res) => {
    const { id } = req.params;
    const { ID_AREA, NOME_SUBAREA } = req.body;

    try {
        const subArea = await SubArea.findByPk(id);
        if (!subArea) {
            return res.status(404).json({ error: 'SubArea não encontrada' });
        }

        subArea.ID_AREA = ID_AREA || subArea.ID_AREA;
        subArea.NOME_SUBAREA = NOME_SUBAREA || subArea.NOME_SUBAREA;

        await subArea.save();
        return res.status(200).json(subArea);
    } catch (error) {
        console.error('Erro ao atualizar SubArea:', error);
        return res.status(500).json({ error: 'Erro ao atualizar SubArea' });
    }
};

// Delete a SubArea by ID
const deleteSubArea = async (req, res) => {
    const { id } = req.params;

    try {
        const subArea = await SubArea.findByPk(id);
        if (!subArea) {
            return res.status(404).json({ error: 'SubArea não encontrada' });
        }

        await subArea.destroy();
        return res.status(200).json({ message: 'SubArea excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir SubArea:', error);
        return res.status(500).json({ error: 'Erro ao excluir SubArea' });
    }
};

const subAreaCheck = async (req, res) => {
    const { subArea, ID_AREA } = req.body;  // Recebe também o ID_AREA

    try {
        // Verificar se a subárea já existe para a área específica
        let existingSubArea = await SubArea.findOne({
            where: {
                NOME_SUBAREA: subArea,
                ID_AREA: ID_AREA  // Verifica se a subárea já existe dentro da área específica
            }
        });

        if (!existingSubArea) {
            // Criar nova subárea se não existir
            const newSubArea = await SubArea.create({
                NOME_SUBAREA: subArea,
                ID_AREA: ID_AREA  // Inclui o ID_AREA ao criar a subárea
            });
            existingSubArea = newSubArea;
        }

        res.json({ subAreaId: existingSubArea.ID_SUB_AREA });  // Assumindo que o campo ID é ID_SUB_AREA
    } catch (error) {
        console.error('Erro ao verificar/criar subárea:', error);
        res.status(500).json({ error: 'Erro ao verificar/criar subárea.' });
    }
};

const subAreaCheckNormal = async (req, res) => {
    const { NOME_SUBAREA, ID_AREA } = req.body;  // Recebe NOME_SUBAREA e ID_AREA

    try {
        // Verificar se a subárea já existe para a área específica
        let existingSubArea = await SubArea.findOne({
            where: {
                NOME_SUBAREA: NOME_SUBAREA,
                ID_AREA: ID_AREA  // Verifica se a subárea já existe dentro da área específica
            }
        });

        if (!existingSubArea) {
            // Criar nova subárea se não existir
            const newSubArea = await SubArea.create({
                NOME_SUBAREA: NOME_SUBAREA,
                ID_AREA: ID_AREA  // Inclui o ID_AREA ao criar a subárea
            });
            existingSubArea = newSubArea;
        }

        res.json({ subAreaId: existingSubArea.ID_SUB_AREA });  // Retorna o ID da subárea criada ou encontrada
    } catch (error) {
        console.error('Erro ao verificar/criar subárea:', error);
        res.status(500).json({ error: 'Erro ao verificar/criar subárea.' });
    }
};

const getSubAreasByAreaId = async (req, res) => {
    const { areaId } = req.params;

    try {
        const subAreas = await SubArea.findAll({
            where: { ID_AREA: areaId },
            include: [
                {
                    model: Area,
                    as: 'area', // Alias utilizado na associação
                    attributes: ['NOME_AREA']
                }
            ]
        });

        if (subAreas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma subárea encontrada para esta área.' });
        }

        return res.status(200).json(subAreas);
    } catch (error) {
        console.error('Erro ao buscar subáreas por ID da área:', error);
        return res.status(500).json({ error: 'Erro ao buscar subáreas por ID da área.' });
    }
};

module.exports = {
    createSubArea,
    getAllSubAreas,
    getSubAreaById,
    updateSubArea,
    deleteSubArea,
    subAreaCheck,
    subAreaCheckNormal,
    getSubAreasByAreaId
};
