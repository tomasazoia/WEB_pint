const Sequelize = require('sequelize');
const sequelize = require('./database');
const Area = require('./area');
const Centro = require('./centro');
const users = require('./users');
const subarea = require('./subArea');

const Notificacoes = sequelize.define('notificacoes', {
    ID_NOTIFICACAO: {
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
    MENSAGEM: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    LIDA: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Notificacoes.belongsTo(users, {foreignKey: 'ID_USER', onDelete: 'CASCADE'});

module.exports = Notificacoes;
