const { DataTypes } = require('sequelize');
const sequelize = require('./database'); 
const Eventos = require('./eventos'); 
const users = require('./users'); 

const ParticipantesEvento = sequelize.define('participantes_evento', {
  ID_FUNCIONARIO: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: users,
      key: 'ID_FUNCIONARIO'
    }
  },
  ID_EVENTO: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Eventos,
      key: 'ID_EVENTO'
    }
  }
}, {
  timestamps: false,
  freezeTableName: true
});

ParticipantesEvento.belongsTo(users, {foreignKey: 'ID_FUNCIONARIO', onDelete: 'CASCADE'});
ParticipantesEvento.belongsTo(Eventos, {foreignKey: 'ID_EVENTO', onDelete: 'CASCADE'});
module.exports = ParticipantesEvento;