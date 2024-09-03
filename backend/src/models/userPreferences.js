const Sequelize = require('sequelize');
const sequelize = require('./database');
const Centro = require('./centro');
const users = require('./users');
const Areas = require('./area');
const SubArea = require('./subArea');

const userPreferences = sequelize.define('userPreferences', {
    ID_Preferencia: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_USER: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        }
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        references: {
            model: Areas,
            key: 'ID_AREA'
        }
    },
    ID_SUBAREA: {
        type: Sequelize.INTEGER,
        references: {
            model: SubArea,
            key: 'ID_SUB_AREA'
        }
    }
}, {
    timestamps: false,  // Define timestamps como false no nível do modelo
    freezeTableName: true // Define freezeTableName como true no nível do modelo
});

userPreferences.belongsTo(users, { foreignKey: 'ID_USER', onDelete: 'CASCADE' });
userPreferences.belongsTo(Areas, { foreignKey: 'ID_AREA', onDelete: 'CASCADE' });
userPreferences.belongsTo(SubArea, { foreignKey: 'ID_SUBAREA', onDelete: 'CASCADE' });

module.exports = userPreferences;
