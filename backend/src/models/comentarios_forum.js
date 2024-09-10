const Sequelize = require('sequelize');
const sequelize = require('./database');
const Forum = require('./forum');
const users = require('./users');

const ComentariosForum = sequelize.define('comentariosforum', {
    ID_COMENTARIO: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_FORUM: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Forum,
            key: 'ID_FORUM'
        }
    },
    DESCRICAO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    DATA_COMENTARIO: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    VALIDAR: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ID_FUNCIONARIO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    freezeTableName: true
});

ComentariosForum.belongsTo(users, { foreignKey: 'ID_FUNCIONARIO', onDelete: 'CASCADE' });
ComentariosForum.belongsTo(Forum, {foreignKey: 'ID_FORUM'});

module.exports = ComentariosForum;