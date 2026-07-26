const mongoose = require('mongoose');
const User = require('../models/User');

const clearAllCollections = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    throw new Error(`Error clearing collections: ${error.message}`);
  }
};

const clearCollection = async (collectionName) => {
  try {
    await mongoose.connection.collection(collectionName).deleteMany({});
  } catch (error) {
    throw new Error(`Error clearing collection ${collectionName}: ${error.message}`);
  }
};

const seedUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    passwordHash: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  try {
    const user = new User({ ...defaultUser, ...userData });
    return await user.save();
  } catch (error) {
    throw new Error(`Error seeding user: ${error.message}`);
  }
};

const seedUsers = async (count = 5) => {
  const users = [];

  try {
    for (let i = 1; i <= count; i++) {
      const user = new User({
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        passwordHash: 'password123',
        firstName: `Test${i}`,
        lastName: `User${i}`
      });
      users.push(await user.save());
    }
    return users;
  } catch (error) {
    throw new Error(`Error seeding users: ${error.message}`);
  }
};

module.exports = {
  clearAllCollections,
  clearCollection,
  seedUser,
  seedUsers
};
