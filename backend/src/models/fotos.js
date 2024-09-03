/*const Sequelize = require('sequelize');
const sequelize = require('./database');
const users = require('./users');
const AlbumFotos = require('./albumFotos');

const Fotos = sequelize.define('fotos', {
    ID_FOTO: {
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
        }
    },
    ID_ALBUM: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: AlbumFotos,
            key: 'ID_ALBUM'
        }
    },
    LEGENDA: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    FOTO: {
        type: Sequelize.BLOB,
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});

Fotos.belongsTo(users, {foreignKey: 'ID_FUNCIONARIO'});
Fotos.belongsTo(AlbumFotos, {foreignKey: 'ID_ALBUM'});
module.exports = Fotos;
*/