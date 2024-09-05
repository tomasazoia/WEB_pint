const Sequelize = require('sequelize');
const sequelize = require('./database');
const Comentarios = require('./comentarios_local');
const users = require('./users');

const Review_Comentarios_Local = sequelize.define('review_comentarios_local', {
    ID_REVIEW: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_COMENTARIO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Comentarios,
            key: 'ID_COMENTARIO'
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
    REVIEW: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    DATA_REVIEW: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Relacionamentos
Review_Comentarios_Local.belongsTo(Comentarios, { foreignKey: 'ID_COMENTARIO', onDelete: 'CASCADE' });
Review_Comentarios_Local.belongsTo(users, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });

Comentarios.hasMany(Review_Comentarios_Local, { foreignKey: 'ID_COMENTARIO', onDelete: 'CASCADE' });
users.hasMany(Review_Comentarios_Local, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });

module.exports = Review_Comentarios_Local;