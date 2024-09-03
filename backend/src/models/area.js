const Sequelize = require('sequelize');
const sequelize = require('./database');

const Area = sequelize.define('area', {
    ID_AREA: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    NOME_AREA: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Area;
