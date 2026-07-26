const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../../src/config/database');
const UserRepository = require('../../src/repositories/UserRepository');
const { clearCollection, seedUser, seedUsers } = require('../../src/utils/database');

describe('User Repository', () => {
  let userRepository;

  before(async function () {
    this.timeout(10000);
    await connectDB();
    userRepository = new UserRepository();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearCollection('users');
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await seedUser({ email: 'findme@example.com' });

      const foundUser = await userRepository.findByEmail('findme@example.com');

      expect(foundUser).to.exist;
      expect(foundUser._id.toString()).to.equal(user._id.toString());
      expect(foundUser.email).to.equal('findme@example.com');
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await userRepository.findByEmail('nonexistent@example.com');

      expect(foundUser).to.be.null;
    });

    it('should handle case-insensitive email search', async () => {
      const user = await seedUser({ email: 'TestUser@Example.com' });

      const foundUser = await userRepository.findByEmail('testuser@example.com');

      expect(foundUser).to.exist;
      expect(foundUser._id.toString()).to.equal(user._id.toString());
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const user = await seedUser({ username: 'uniqueuser' });

      const foundUser = await userRepository.findByUsername('uniqueuser');

      expect(foundUser).to.exist;
      expect(foundUser._id.toString()).to.equal(user._id.toString());
    });

    it('should return null for non-existent username', async () => {
      const foundUser = await userRepository.findByUsername('nonexistent');

      expect(foundUser).to.be.null;
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user with password hash', async () => {
      const plainPassword = 'testpassword123';
      const user = await seedUser({ 
        email: 'withpass@example.com',
        passwordHash: plainPassword
      });

      const foundUser = await userRepository.findByEmailWithPassword('withpass@example.com');

      expect(foundUser).to.exist;
      expect(foundUser.passwordHash).to.exist;
      expect(foundUser.passwordHash).to.not.equal(plainPassword);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        passwordHash: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const user = await userRepository.createUser(userData);

      expect(user._id).to.exist;
      expect(user.username).to.equal('newuser');
      expect(user.email).to.equal('newuser@example.com');
    });

    it('should throw error for duplicate email', async () => {
      await seedUser({ email: 'duplicate@example.com' });

      try {
        await userRepository.createUser({
          username: 'anotheruser',
          email: 'duplicate@example.com',
          passwordHash: 'password123'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Email already in use');
      }
    });

    it('should throw error for duplicate username', async () => {
      await seedUser({ username: 'duplicateuser' });

      try {
        await userRepository.createUser({
          username: 'duplicateuser',
          email: 'another@example.com',
          passwordHash: 'password123'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Username already in use');
      }
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const user = await seedUser();
      const originalLastLogin = user.lastLogin;

      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedUser = await userRepository.updateLastLogin(user._id.toString());

      expect(updatedUser.lastLogin).to.exist;
      expect(updatedUser.lastLogin).to.not.equal(originalLastLogin);
      expect(updatedUser.lastLogin).to.be.instanceOf(Date);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile without password', async () => {
      const user = await seedUser();

      const profile = await userRepository.getUserProfile(user._id.toString());

      expect(profile).to.exist;
      expect(profile.passwordHash).to.not.exist;
      expect(profile.username).to.exist;
      expect(profile.email).to.exist;
    });

    it('should return null for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const profile = await userRepository.getUserProfile(fakeId);

      expect(profile).to.be.null;
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', async () => {
      await seedUser({ email: 'exists@example.com' });

      const exists = await userRepository.emailExists('exists@example.com');

      expect(exists).to.not.be.null;
    });

    it('should return false for non-existent email', async () => {
      const exists = await userRepository.emailExists('notexists@example.com');

      expect(exists).to.be.null;
    });

    it('should exclude specified user ID from check', async () => {
      const user = await seedUser({ email: 'update@example.com' });

      const exists = await userRepository.emailExists('update@example.com', user._id.toString());

      expect(exists).to.be.null;
    });
  });

  describe('usernameExists', () => {
    it('should return true for existing username', async () => {
      await seedUser({ username: 'existinguser' });

      const exists = await userRepository.usernameExists('existinguser');

      expect(exists).to.not.be.null;
    });

    it('should return false for non-existent username', async () => {
      const exists = await userRepository.usernameExists('notexistinguser');

      expect(exists).to.be.null;
    });
  });

  describe('find (from BaseRepository)', () => {
    it('should find multiple users', async () => {
      await seedUsers(3);

      const users = await userRepository.find();

      expect(users).to.have.lengthOf(3);
    });

    it('should support pagination', async () => {
      await seedUsers(10);

      const users = await userRepository.find({}, { skip: 2, limit: 3 });

      expect(users).to.have.lengthOf(3);
    });

    it('should support sorting', async () => {
      await seedUsers(3);

      const users = await userRepository.find({}, { sort: { username: -1 } });

      expect(users[0].username).to.equal('testuser3');
      expect(users[2].username).to.equal('testuser1');
    });
  });

  describe('count (from BaseRepository)', () => {
    it('should count documents', async () => {
      await seedUsers(5);

      const count = await userRepository.count();

      expect(count).to.equal(5);
    });

    it('should count with query', async () => {
      await seedUser({ isActive: true });
      await seedUser({ isActive: false, username: 'inactiveuser', email: 'inactive@test.com' });

      const count = await userRepository.count({ isActive: true });

      expect(count).to.equal(1);
    });
  });
});
