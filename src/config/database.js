const mongoose = require('mongoose');
const { config } = require('./environment');

let listenersAttached = false;

const attachConnectionListeners = () => {
  if (listenersAttached) {
    return;
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  listenersAttached = true;
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(process.env.MONGODB_URI || config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    attachConnectionListeners();
    console.log('Database connection successful');

    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      return;
    }

    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Failed to disconnect from database:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
