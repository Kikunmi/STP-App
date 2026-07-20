const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    try {
      return await this.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findByUsername(username) {
    try {
      return await this.findOne({ username: username.trim() });
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  async findByEmailWithPassword(email) {
    try {
      return await this.model.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    } catch (error) {
      throw new Error(`Error finding user with password: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const existingUser = await this.model.findOne({
        $or: [{ email: userData.email.toLowerCase() }, { username: userData.username }]
      });

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw new Error('Email already in use');
        }
        throw new Error('Username already in use');
      }

      return await this.create(userData);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async updateLastLogin(userId) {
    try {
      return await this.findByIdAndUpdate(userId, {
        lastLogin: new Date()
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.findById(userId);
      return user ? user.toJSON() : null;
    } catch (error) {
      throw new Error(`Error getting user profile: ${error.message}`);
    }
  }

  async emailExists(email, excludeUserId = null) {
    try {
      const query = { email: email.toLowerCase() };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      return await this.exists(query);
    } catch (error) {
      throw new Error(`Error checking email existence: ${error.message}`);
    }
  }

  async usernameExists(username, excludeUserId = null) {
    try {
      const query = { username };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      return await this.exists(query);
    } catch (error) {
      throw new Error(`Error checking username existence: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
