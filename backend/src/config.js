require('dotenv').config();

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT || 3000,
};
