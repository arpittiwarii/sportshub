const mongoose = require('mongoose');
const { config } = require('../env');
const { DatabaseError } = require('../Error/DataBaseError.js');

async function connectDB() {
  try {
    if (!config.database.mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(config.database.mongoUri);
    console.log(`Database connected : ${mongoose.connection.name}`);
  } catch (err) {
    throw new DatabaseError(err?.message || 'MongoDB connection failed');
  }
}

module.exports = { mongoose, connectDB };
