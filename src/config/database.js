const { Sequelize } = require('sequelize');
const config = require('./config');

const environment = process.env.NODE_ENV || 'development';
const databaseConfig = config[environment];

const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  databaseConfig,
);

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection established.');
  } catch (error) {
    console.error('PostgreSQL connection could not be established:', error.message);
  }
};

module.exports = { sequelize, testDatabaseConnection };
