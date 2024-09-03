const Sequelize = require('sequelize');
const sequelize = require('./database');
const Centro = require('./centro');
const users = require('./users');
//const ComentariosForum = require('./comentarios_forum');
const Areas = require('./area');

const Forum = sequelize.define('forum', {
    ID_FORUM: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_CENTRO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Centro,
            key: 'ID_CENTRO'
        }
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        references: {
            model: Areas,
            key: 'ID_AREA'
        }
    },
    ID_CRIADOR: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        }
    },
    NOME_FORUM: {
        type: Sequelize.TEXT,
        allowNull: false
    },
},
    {
        timestamps: false,
        freezeTableName: true
    });
Forum.belongsTo(Centro, { foreignKey: 'ID_CENTRO', onDelete: 'CASCADE' });
Forum.belongsTo(users, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });
Forum.belongsTo(Areas, { foreignKey: 'ID_AREA', onDelete: 'CASCADE' });

module.exports = Forum;
