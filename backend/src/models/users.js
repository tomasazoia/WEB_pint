const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Centro = require('./centro');

const User = sequelize.define('User', {
  ID_FUNCIONARIO: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  ID_ADMIN: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  user_mail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  user_password: {
    type: DataTypes.STRING(255),
    allowNull: true, 
  },
  email_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
  },
  NIF: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  MORADA: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  NTELEMOVEL: {
    type: Sequelize.NUMERIC,
    allowNull: true
  },
  ADMINISTRADOR: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  VALIDAR: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  DATAINICIO: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  reset_password: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,  // Indica que o usuário precisa redefinir a senha
  },
  reset_password_code: {
    type: DataTypes.STRING(255), // Campo para armazenar o código de recuperação criptografado
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.belongsTo(Centro, { foreignKey: 'ID_CENTRO', onDelete: 'CASCADE' });

module.exports = User;
