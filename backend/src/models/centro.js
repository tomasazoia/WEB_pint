const Sequelize = require('sequelize');
const sequelize = require('./database');

const Centro = sequelize.define('centro', {
    ID_CENTRO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    NOME_CENTRO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    MORADA: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    N_EVENTOS: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Centro;
