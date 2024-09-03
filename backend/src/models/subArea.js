const Sequelize = require('sequelize');
const sequelize = require('./database');
const Area = require('./area');

const SubArea = sequelize.define('sub_area', {
    ID_SUB_AREA: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Area,
            key: 'ID_AREA'
        }
    },
    NOME_SUBAREA: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

SubArea.belongsTo(Area, {foreignKey: 'ID_AREA',onDelete: 'CASCADE'} );

module.exports = SubArea;
