const { Sequelize } = require('sequelize');

const dialectOptions = {};
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
      };

const sequelize = new Sequelize({
    database: 'database_pint', 
    username: 'database_pint_user', 
    password: '7QueNRqPOwYrAclwSNHLrePHf6apOyGv', 
    host: 'dpg-crgchfo8fa8c73aod6sg-a.frankfurt-postgres.render.com', 
    port: 5432, 
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true 
        }
      }
});

module.exports = sequelize, dialectOptions;