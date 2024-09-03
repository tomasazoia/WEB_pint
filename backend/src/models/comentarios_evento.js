const Sequelize = require('sequelize');
const sequelize = require('./database');
const users = require('./users');
const Eventos = require('./eventos'); 

const ComentariosEvento = sequelize.define('comentariosevento', {
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
    ID_EVENTO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Eventos,
            key: 'ID_EVENTO'
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

ComentariosEvento.belongsTo(users, {foreignKey: 'ID_FUNCIONARIO', onDelete: 'CASCADE' });
ComentariosEvento.belongsTo(Eventos, {foreignKey: 'ID_EVENTO', onDelete: 'CASCADE', as: 'evento'});

module.exports = ComentariosEvento;
