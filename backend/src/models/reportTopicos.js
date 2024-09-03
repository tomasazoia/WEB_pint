const Sequelize = require('sequelize');
const sequelize = require('./database');

const ReportTopicos = sequelize.define('reporttopicos', {
    ID_TOPICO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    NOME_TOPICO: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = ReportTopicos;