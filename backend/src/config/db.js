const Sequelize = require('sequelize')
const { config } = require('../env.js')
const { DatabaseError } = require('../Error/DataBaseError.js')

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });


async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`Database connected : ${config?.DB_NAME}`);
  }
  catch (err) {
    throw new Sequelize.DatabaseError(err?.message)
  }
}

module.exports = { sequelize, connectDB }