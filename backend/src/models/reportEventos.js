const Sequelize = require('sequelize');
const sequelize = require('./database');
const ComentariosEvento = require('./comentarios_evento');
const ReportTopicos = require('./reportTopicos');

const ReportEventos = sequelize.define('reporteventos', {
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
            model: ComentariosEvento,
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
ReportEventos.belongsTo(ComentariosEvento, { foreignKey: 'ID_COMENTARIO_REPORTADO' });
ReportEventos.belongsTo(ReportTopicos, { foreignKey: 'ID_TIPO_REPORT' });

module.exports = ReportEventos;