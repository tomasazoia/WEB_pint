const Sequelize = require('sequelize');
const sequelize = require('./database');

const Formularios = sequelize.define('formularios', {
    ID_FORMULARIO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    NOME_FORMULARIO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    ATIVO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Formularios;
