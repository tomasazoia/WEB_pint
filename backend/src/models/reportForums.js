const Sequelize = require('sequelize');
const sequelize = require('./database');
const ComentariosForum = require('./comentarios_forum');
const ReportTopicos = require('./reportTopicos');

const ReportForums = sequelize.define('reportforums', {
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
            model: ComentariosForum,
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
ReportForums.belongsTo(ComentariosForum, { foreignKey: 'ID_COMENTARIO_REPORTADO'});
ReportForums.belongsTo(ReportTopicos, { foreignKey: 'ID_TIPO_REPORT'});

module.exports = ReportForums;