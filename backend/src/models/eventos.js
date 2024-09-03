const Sequelize = require('sequelize');
const sequelize = require('./database');
const Centro = require('./centro');
const users = require('./users');
//const AlbumFotos = require('./albumFotos');
//const Locais = require('./locais');
//const ComentariosEvento = require('./comentarios_evento');
const Areas = require('./area');
const subarea = require('./subArea');

const Eventos = sequelize.define('eventos', {
    ID_EVENTO: {
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
    ID_CRIADOR: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: users,
            key: 'ID_FUNCIONARIO'
        }
    },
    NOME_EVENTO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    TIPO_EVENTO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    DATA_EVENTO: {
        type: Sequelize.DATE,
        allowNull: true
    },
    DISPONIBILIDADE: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    LOCALIZACAO: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    ID_AREA: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Areas,
            key: 'ID_AREA'
        }
    },
    ID_SUB_AREA: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: subarea,
            key: 'ID_SUB_AREA'
        }
    },
    N_PARTICIPANTES: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    foto: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, 
{
    timestamps: false,
    freezeTableName: true
});
Eventos.belongsTo(Centro, {foreignKey: 'ID_CENTRO', onDelete: 'CASCADE'});
Eventos.belongsTo(users, {foreignKey: 'ID_CRIADOR', onDelete: 'CASCADE'});
Eventos.belongsTo(Areas, { foreignKey: 'ID_AREA', onDelete: 'CASCADE' });
Eventos.belongsTo(subarea, {foreignKey: 'ID_SUB_AREA', onDelete: 'CASCADE'});

module.exports = Eventos;
