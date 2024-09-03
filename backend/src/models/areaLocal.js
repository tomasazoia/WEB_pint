const Sequelize = require('sequelize');
const sequelize = require('./database');
const Locais = require('./locais');
const Area = require('./area');

const AreaLocal = sequelize.define('arealocal', {
    ID_LOCAL: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Locais,
            key: 'ID_LOCAL'
        }
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Area,
            key: 'ID_AREA'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

AreaLocal.belongsTo(Locais, {foreignKey: 'ID_LOCAL'});
AreaLocal.belongsTo(Area, {foreignKey: 'ID_AREA'});
module.exports = AreaLocal;
