const Sequelize = require('sequelize');
const sequelize = require('./database');
const ComentariosLocal = require('./comentarios_local');
const ReportTopicos = require('./reportTopicos');

const ReportLocais = sequelize.define('reportlocais', {
    ID_REPORT: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    ID_COMENTARIO_REPORTADO: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: ComentariosLocal,
            key: 'ID_COMENTARIO'
        }
    },
    ID_TIPO_REPORT: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: ReportTopicos,
            key: 'ID_TOPICO'
        }
    },
    DATA_REPORT: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
},
    {
        timestamps: false,
        freezeTableName: true
    });
ReportLocais.belongsTo(ComentariosLocal, { foreignKey: 'ID_COMENTARIO_REPORTADO' });
ReportLocais.belongsTo(ReportTopicos, { foreignKey: 'ID_TIPO_REPORT' });

module.exports = ReportLocais;