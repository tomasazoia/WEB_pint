const { Sequelize } = require('sequelize');

const dialectOptions = {};
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
      };

const sequelize = new Sequelize({
    database: 'pint_9w7c', 
    username: 'pint_9w7c_user', 
    password: '123uW1zulhr7o2kDzQXwIW0jOme2tWyU8yD4', 
    host: 'dpg-crbkikjtq21c73ck2q6g-a.frankfurt-postgres.render.com', 
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