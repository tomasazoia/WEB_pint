const { Sequelize } = require('sequelize');

/* const dialectOptions = {};
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
      };*/

const sequelize = new Sequelize({
    database: 'pint', 
    username: 'postgres', 
    password: '1234', 
    host: 'localhost', 
    port: 5432, 
    dialect: 'postgres'/*, 
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true 
        }
      }*/
});

module.exports = sequelize/*, dialectOptions*/;