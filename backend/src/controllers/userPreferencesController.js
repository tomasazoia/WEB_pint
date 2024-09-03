const UserPreferences = require('../models/userPreferences'); // Caminho para o model UserPreferences
const Users = require('../models/users'); // Caminho para o model Users
const Areas = require('../models/area'); // Caminho para o model Areas
const SubArea = require('../models/subArea'); // Caminho para o model SubArea

// Create a new UserPreference
const createUserPreference = async (req, res) => {
    const { ID_USER, ID_AREA, ID_SUBAREA } = req.body;

    if (!ID_USER || !ID_AREA || !ID_SUBAREA) {
        return res.status(400).json({ error: 'ID_USER, ID_AREA e ID_SUBAREA são obrigatórios' });
    }

    try {
        const newUserPreference = await UserPreferences.create({ ID_USER, ID_AREA, ID_SUBAREA });
        return res.status(201).json(newUserPreference);
    } catch (error) {
        console.error('Erro ao criar preferência do usuário:', error);
        return res.status(500).json({ error: 'Erro ao criar preferência do usuário' });
    }
};

// Get all UserPreferences
const getAllUserPreferences = async (req, res) => {
    try {
        const userPreferences = await UserPreferences.findAll({ include: [Users, Areas, SubArea] });
        return res.status(200).json(userPreferences);
    } catch (error) {
        console.error('Erro ao buscar preferências dos usuários:', error);
        return res.status(500).json({ error: 'Erro ao buscar preferências dos usuários' });
    }
};

// Get a single UserPreference by ID
const getUserPreferenceById = async (req, res) => {
    const { id } = req.params;

    try {
        const userPreference = await UserPreferences.findByPk(id, { include: [Users, Areas, SubArea] });
        if (!userPreference) {
            return res.status(404).json({ error: 'Preferência do usuário não encontrada' });
        }
        return res.status(200).json(userPreference);
    } catch (error) {
        console.error('Erro ao buscar preferência do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar preferência do usuário' });
    }
};

// Update a UserPreference by ID
const updateUserPreferences = async (req, res) => {
    const { userId } = req.params; 
    const { areas, subAreas } = req.body; 

    try {
        const updatedPreferences = await UserPreferences.sequelize.transaction(async (t) => {
            // Remover registros inválidos com áreas ou subáreas nulas
            await UserPreferences.destroy({
                where: {
                    ID_USER: userId,
                    ID_AREA: null,
                    ID_SUBAREA: null
                },
                transaction: t
            });

            // Buscar preferências existentes do usuário
            const existingPreferences = await UserPreferences.findAll({
                where: { ID_USER: userId },
                transaction: t
            });

            const existingAreaIds = existingPreferences
                .filter(pref => pref.ID_AREA !== null)
                .map(pref => pref.ID_AREA);

            const existingSubAreaIds = existingPreferences
                .filter(pref => pref.ID_SUBAREA !== null)
                .map(pref => pref.ID_SUBAREA);

            // Remover preferências desmarcadas
            await UserPreferences.destroy({
                where: {
                    ID_USER: userId,
                    ID_AREA: existingAreaIds.filter(areaId => !areas.includes(areaId))
                },
                transaction: t
            });

            await UserPreferences.destroy({
                where: {
                    ID_USER: userId,
                    ID_SUBAREA: existingSubAreaIds.filter(subAreaId => !subAreas.includes(subAreaId))
                },
                transaction: t
            });

            // Adicionar ou atualizar preferências válidas
            const areaPreferences = await Promise.all(
                areas.map(async (areaId) => {
                    if (!areaId) return; // Ignorar IDs nulos
                    const [preference, created] = await UserPreferences.findOrCreate({
                        where: { ID_USER: userId, ID_AREA: areaId },
                        defaults: { ID_USER: userId, ID_AREA: areaId },
                        transaction: t
                    });

                    if (!created) {
                        preference.ID_AREA = areaId;
                        await preference.save({ transaction: t });
                    }
                    return preference;
                })
            );

            const subAreaPreferences = await Promise.all(
                subAreas.map(async (subAreaId) => {
                    if (!subAreaId) return; // Ignorar IDs nulos
                    const [preference, created] = await UserPreferences.findOrCreate({
                        where: { ID_USER: userId, ID_SUBAREA: subAreaId },
                        defaults: { ID_USER: userId, ID_SUBAREA: subAreaId },
                        transaction: t
                    });

                    if (!created) {
                        preference.ID_SUBAREA = subAreaId;
                        await preference.save({ transaction: t });
                    }
                    return preference;
                })
            );

            return { areas: areaPreferences, subAreas: subAreaPreferences };
        });

        return res.status(200).json(updatedPreferences);
    } catch (error) {
        console.error('Erro ao atualizar as preferências do usuário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar as preferências do usuário' });
    }
};


// Delete a UserPreference by ID
const deleteUserPreference = async (req, res) => {
    const { id } = req.params;

    try {
        const userPreference = await UserPreferences.findByPk(id);
        if (!userPreference) {
            return res.status(404).json({ error: 'Preferência do usuário não encontrada' });
        }

        await userPreference.destroy();
        return res.status(200).json({ message: 'Preferência do usuário excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir preferência do usuário:', error);
        return res.status(500).json({ error: 'Erro ao excluir preferência do usuário' });
    }
};

const getUserPreferenceByUser = async (req, res) => { 
    const { id } = req.params;
   
    try {
        if (!id) {
            return res.status(400).json({ message: 'ID de usuário não encontrado.' });
        }

        const preferences = await UserPreferences.findAll({
            where: { ID_USER: id },
            include: [{ model: Areas }, { model: SubArea }]
        });

        res.json(preferences);
    } catch (error) {
        console.error('Erro ao obter as preferências do utilizador:', error);
        res.status(500).json({ message: 'Erro ao obter as preferências do utilizador.' });
    }
};

  


module.exports = {
    createUserPreference,
    getAllUserPreferences,
    getUserPreferenceById,
    updateUserPreferences,
    deleteUserPreference,
    getUserPreferenceByUser
};
