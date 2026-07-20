const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('User Management Routes', () => {
  let authToken;
  let userId;
  let testUser;
  const authHeader = (token) => 'B' + 'earer ' + token;

  before(async function () {
    this.timeout(10000);
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearCollection('users');
    testUser = await seedUser({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'SecurePass123',
      firstName: 'Test',
      lastName: 'User'
    });
    userId = testUser._id.toString();
    authToken = AuthService.generateToken({
      id: userId,
      email: testUser.email,
      username: testUser.username
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with firstName and lastName', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.user.firstName).to.equal('Updated');
      expect(response.body.data.user.lastName).to.equal('Name');
    });

    it('should update only firstName', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'OnlyFirstName'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.user.firstName).to.equal('OnlyFirstName');
      expect(response.body.data.user.lastName).to.equal('User'); // unchanged
    });

    it('should update only lastName', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lastName: 'OnlyLastName'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.user.lastName).to.equal('OnlyLastName');
    });

    it('should reject update with no fields', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('NO_UPDATE_FIELDS');
    });

    it('should reject update with invalid firstName length', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'a'.repeat(51) // Too long
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('firstName');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ firstName: 'Updated' });

      expect(response.status).to.equal(401);
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'InvalidFormat')
        .send({ firstName: 'Updated' });

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });
  });

  describe('PUT /api/users/username', () => {
    it('should update username successfully', async () => {
      const response = await request(app)
        .put('/api/users/username')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'newusername'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.user.username).to.equal('newusername');
    });

    it('should reject update to same username', async () => {
      const response = await request(app)
        .put('/api/users/username')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'testuser' // Current username
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('SAME_USERNAME');
    });

    it('should reject duplicate username', async () => {
      await seedUser({ username: 'anotheruser', email: 'another@example.com' });

      const response = await request(app)
        .put('/api/users/username')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'anotheruser'
        });

      expect(response.status).to.equal(409);
      expect(response.body.code).to.equal('USERNAME_EXISTS');
    });

    it('should reject invalid username format', async () => {
      const response = await request(app)
        .put('/api/users/username')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'invalid@user#name'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('username');
    });

    it('should reject username too short', async () => {
      const response = await request(app)
        .put('/api/users/username')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'ab'
        });

      expect(response.status).to.equal(400);
    });
  });

  describe('POST /api/users/change-password', () => {
    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'SecurePass123',
          newPassword: 'NewSecurePass456',
          confirmPassword: 'NewSecurePass456'
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('Password changed');
    });

    it('should reject with wrong current password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPass123',
          newPassword: 'NewSecurePass456',
          confirmPassword: 'NewSecurePass456'
        });

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('INVALID_PASSWORD');
    });

    it('should reject if passwords do not match', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'SecurePass123',
          newPassword: 'NewSecurePass456',
          confirmPassword: 'DifferentPass789'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('confirmPassword');
    });

    it('should reject if new password same as current', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'SecurePass123',
          newPassword: 'SecurePass123',
          confirmPassword: 'SecurePass123'
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('SAME_PASSWORD');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'SecurePass123',
          newPassword: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('newPassword');
    });

    it('should reject expired token', async () => {
      const expiredToken = AuthService.generateToken({
        id: userId,
        email: testUser.email,
        username: testUser.username
      }, '1ms');

      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', authHeader(expiredToken))
        .send({
          currentPassword: 'SecurePass123',
          newPassword: 'NewSecurePass456',
          confirmPassword: 'NewSecurePass456'
        });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('TOKEN_EXPIRED');
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete account with correct password', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('Account deleted');

      // Verify user is deleted
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(loginResponse.status).to.equal(401);
    });

    it('should reject deletion with wrong password', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'WrongPass123'
        });

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('INVALID_PASSWORD');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .send({
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(401);
    });

    it('should return 404 when the token user no longer exists', async () => {
      const missingUserToken = AuthService.generateToken({
        id: '507f1f77bcf86cd799439011',
        email: 'missing@example.com',
        username: 'missinguser'
      });

      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', authHeader(missingUserToken))
        .send({
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('USER_NOT_FOUND');
      expect(response.body.status).to.equal('error');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Seed multiple users
      for (let i = 2; i <= 15; i++) {
        await seedUser({
          username: `user${i}`,
          email: `user${i}@example.com`,
          passwordHash: 'SecurePass123'
        });
      }
    });

    it('should get users with default pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.users).to.be.an('array');
      expect(response.body.data.users).to.have.lengthOf(10); // Default limit
      expect(response.body.data.pagination).to.have.keys('total', 'page', 'limit', 'pages');
      expect(response.body.data.pagination.total).to.equal(15);
    });

    it('should support custom pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.users).to.have.lengthOf(5);
      expect(response.body.data.pagination.page).to.equal(2);
      expect(response.body.data.pagination.limit).to.equal(5);
    });

    it('should cap limit at 100', async () => {
      const response = await request(app)
        .get('/api/users?limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.pagination.limit).to.equal(100);
    });

    it('should exclude password from user objects', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      response.body.data.users.forEach(user => {
        expect(user).to.not.have.property('passwordHash');
      });
    });
  });

  describe('GET /api/users/search', () => {
    beforeEach(async () => {
      await seedUser({ username: 'searchuser1', email: 'search1@example.com' });
      await seedUser({ username: 'searchuser2', email: 'search2@example.com' });
      await seedUser({ username: 'otheruser', email: 'other@example.com' });
    });

    it('should search users by username', async () => {
      const response = await request(app)
        .get('/api/users/search?q=searchuser&type=username')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.users).to.have.length.greaterThan(0);
      expect(response.body.data.users[0].username).to.include('searchuser');
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/users/search?q=search&type=email')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.count).to.be.greaterThan(0);
    });

    it('should default to username search', async () => {
      const response = await request(app)
        .get('/api/users/search?q=otheruser')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.count).to.equal(1);
    });

    it('should reject query less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/users/search?q=a')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('INVALID_SEARCH_QUERY');
    });

    it('should reject missing search query', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(400);
    });

    it('should be case-insensitive', async () => {
      const response = await request(app)
        .get('/api/users/search?q=SEARCHUSER&type=username')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.count).to.be.greaterThan(0);
    });
  });
});
