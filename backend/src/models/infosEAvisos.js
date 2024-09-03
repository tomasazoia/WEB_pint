const Sequelize = require('sequelize');
const sequelize = require('./database');
const users = require('./users'); // Modelo de Usuários (Assumindo que já existe)

// Definição do modelo para Informacoes/Avisos
const Informacoes = sequelize.define('informacoes', {
    ID_INFORMACAO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    TITULO: {
        type: Sequelize.STRING,
        allowNull: false
    },
    DESCRICAO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    DATA_CRIACAO: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    ID_CRIADOR: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Relação com o modelo de Usuários
Informacoes.belongsTo(users, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE', as: 'users'});

module.exports = Informacoes;
