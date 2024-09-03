const Sequelize = require('sequelize');
const sequelize = require('./database');
const Eventos = require('./eventos');
const users = require('./users');

const AlbumFotos = sequelize.define('albumfotos', {
    ID_FOTO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_EVENTO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Eventos,
            key: 'ID_EVENTO'
        },
        onDelete: 'CASCADE'
    },
    DATA_ADICAO: {
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
        }
    },
    LEGENDA: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    foto: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

AlbumFotos.belongsTo(users, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });
AlbumFotos.belongsTo(Eventos, { foreignKey: 'ID_EVENTO', onDelete: 'CASCADE' });

module.exports = AlbumFotos;