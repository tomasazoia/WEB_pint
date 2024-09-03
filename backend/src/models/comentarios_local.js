const Sequelize = require('sequelize');
const sequelize = require('./database');
const users = require('./users');
const Local = require('./locais'); 

const ComentariosLocal = sequelize.define('comentarioslocal', {
    ID_COMENTARIO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_FUNCIONARIO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        },
        onDelete: 'CASCADE'
    },
    ID_LOCAL: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Local,
            key: 'ID_LOCAL'
          }
    },
    DATA_COMENTARIO: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    DESCRICAO: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    VALIDAR: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    freezeTableName: true
});

ComentariosLocal.belongsTo(users, {foreignKey: 'ID_FUNCIONARIO', onDelete: 'CASCADE' });
ComentariosLocal.belongsTo(Local, {foreignKey: 'ID_LOCAL', onDelete: 'CASCADE', as: 'local'});

module.exports = ComentariosLocal;
