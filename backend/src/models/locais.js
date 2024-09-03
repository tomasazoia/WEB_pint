const Sequelize = require('sequelize');
const sequelize = require('./database');
const Area = require('./area');
const Centro = require('./centro');
const users = require('./users');
const subarea = require('./subArea');

const Locais = sequelize.define('locais', {
    ID_LOCAL: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_CENTRO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Centro,
            key: 'ID_CENTRO'
        }
    },
    ID_CRIADOR: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        }
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Area,
            key: 'ID_AREA'
        }
    },
    ID_SUB_AREA: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: subarea,
            key: 'ID_SUB_AREA'
        }
    },
    DESIGNACAO_LOCAL: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    LOCALIZACAO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    REVIEW: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    VALIDAR: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    PRECO: {
        type: Sequelize.FLOAT,
        allowNull: false
    },

    foto: {
        type: Sequelize.STRING,
        allowNull: true
      }
}, {
    timestamps: false,
    freezeTableName: true
});

Locais.belongsTo(Centro, {foreignKey: 'ID_CENTRO', onDelete: 'CASCADE'});
Locais.belongsTo(Area, {foreignKey: 'ID_AREA', onDelete: 'CASCADE'});
Locais.belongsTo(users, {foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE'});
Locais.belongsTo(subarea, {foreignKey: 'ID_SUB_AREA', onDelete: 'CASCADE'});

module.exports = Locais;