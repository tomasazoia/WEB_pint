const Sequelize = require('sequelize');
const sequelize = require('./database');
const Locais = require('./locais');
const users = require('./users');

const Review = sequelize.define('review', {
    ID_REVIEW: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_LOCAL: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Locais,
            key: 'ID_LOCAL'
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
Review.belongsTo(Locais, { foreignKey: 'ID_LOCAL', onDelete: 'CASCADE' });
Review.belongsTo(users, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });

Locais.hasMany(Review, { foreignKey: 'ID_LOCAL', onDelete: 'CASCADE' });
users.hasMany(Review, { foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE' });

module.exports = Review;
