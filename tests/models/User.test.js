const { expect } = require('chai');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/database');
const User = require('../../src/models/User');
const { clearCollection, seedUser } = require('../../src/utils/database');

describe('User Model', () => {
  before(async function () {
    this.timeout(10000);
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearCollection('users');
  });

  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        passwordHash: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).to.exist;
      expect(savedUser.username).to.equal('newuser');
      expect(savedUser.email).to.equal('newuser@example.com');
      expect(savedUser.isActive).to.be.true;
      expect(savedUser.passwordHash).to.not.equal('password123');
    });

    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'password123'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('Username is required');
      }
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        passwordHash: 'password123'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('Email is required');
      }
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('Password is required');
      }
    });
  });

  describe('Email Validation', () => {
    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        passwordHash: 'password123'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('valid email');
      }
    });

    it('should store email in lowercase', async () => {
      const user = await seedUser({
        email: 'TestUser@Example.com'
      });

      expect(user.email).to.equal('testuser@example.com');
    });

    it('should enforce unique email', async () => {
      await seedUser({ email: 'unique@example.com' });

      const duplicateUser = new User({
        username: 'anotheruser',
        email: 'unique@example.com',
        passwordHash: 'password123'
      });

      try {
        await duplicateUser.save();
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.message).to.include('duplicate');
      }
    });
  });

  describe('Username Validation', () => {
    it('should require minimum username length', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        passwordHash: 'password123'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('at least 3 characters');
      }
    });

    it('should enforce unique username', async () => {
      await seedUser({ username: 'unique_user' });

      const duplicateUser = new User({
        username: 'unique_user',
        email: 'another@example.com',
        passwordHash: 'password123'
      });

      try {
        await duplicateUser.save();
        expect.fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.message).to.include('duplicate');
      }
    });

    it('should validate username format', async () => {
      const userData = {
        username: 'user@#$',
        email: 'test@example.com',
        passwordHash: 'password123'
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.include('only contain letters, numbers');
      }
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'securepassword123';
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: plainPassword
      });

      await user.save();

      const fetchedUser = await User.findById(user._id).select('+passwordHash');
      expect(fetchedUser.passwordHash).to.not.equal(plainPassword);
    });

    it('should not update password on non-password update', async () => {
      const user = await seedUser({ passwordHash: 'originalpassword' });
      const originalHash = user.passwordHash;

      user.firstName = 'Updated';
      await user.save();

      expect(user.passwordHash).to.equal(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare passwords', async () => {
      const plainPassword = 'testpassword123';
      const user = await seedUser({ passwordHash: plainPassword });

      const userWithPassword = await User.findById(user._id).select('+passwordHash');
      const isMatch = await userWithPassword.comparePassword(plainPassword);

      expect(isMatch).to.be.true;
    });

    it('should reject incorrect password', async () => {
      const user = await seedUser({ passwordHash: 'correctpassword' });

      const userWithPassword = await User.findById(user._id).select('+passwordHash');
      const isMatch = await userWithPassword.comparePassword('wrongpassword');

      expect(isMatch).to.be.false;
    });
  });

  describe('User toJSON Method', () => {
    it('should exclude password hash from JSON', async () => {
      const user = await seedUser();
      const jsonUser = user.toJSON();

      expect(jsonUser.passwordHash).to.not.exist;
      expect(jsonUser.username).to.exist;
      expect(jsonUser.email).to.exist;
    });
  });

  describe('User Timestamps', () => {
    it('should set createdAt and updatedAt', async () => {
      const user = await seedUser();

      expect(user.createdAt).to.be.instanceOf(Date);
      expect(user.updatedAt).to.be.instanceOf(Date);
    });

    it('should update updatedAt when user is modified', async () => {
      const user = await seedUser();
      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      user.firstName = 'UpdatedName';
      await user.save();

      expect(user.updatedAt.getTime()).to.be.greaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('User Indexes', () => {
    it('should have email index', async () => {
      const indexes = User.schema.indexes().map(([fields]) => fields);
      expect(indexes).to.deep.include({ email: 1 });
    });

    it('should have username index', async () => {
      const indexes = User.schema.indexes().map(([fields]) => fields);
      expect(indexes).to.deep.include({ username: 1 });
    });
  });
});
