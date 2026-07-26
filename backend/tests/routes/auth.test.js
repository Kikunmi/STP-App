const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Authentication Routes', () => {
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
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'SecurePass123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.have.keys('user', 'accessToken', 'expiresIn');
      expect(response.body.data.user.username).to.equal('newuser');
      expect(response.body.data.user.email).to.equal('newuser@example.com');
      expect(response.body.data.user).to.not.have.property('passwordHash');
      expect(response.body.data.accessToken).to.be.a('string');
    });

    it('should reject registration with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // Too short
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.include('Validation failed');
      expect(response.body.errors).to.have.lengthOf(1);
      expect(response.body.errors[0].field).to.equal('username');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          email: 'invalid-email',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('email');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'weak' // No uppercase, number, or length
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('password');
    });

    it('should reject registration with duplicate email', async () => {
      await seedUser({ email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(409);
      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.include('Email already registered');
      expect(response.body.code).to.equal('EMAIL_EXISTS');
      expect(response.body).to.not.have.property('data');
    });

    it('should reject registration with duplicate username', async () => {
      await seedUser({ username: 'existinguser' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'newemail@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(409);
      expect(response.body.message).to.include('Username is already taken');
      expect(response.body.code).to.equal('USERNAME_EXISTS');
    });

    it('should accept optional firstName and lastName', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'userwithoutnamesfields',
          email: 'nonames@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(201);
      expect(response.body.data.user.firstName).to.equal('');
      expect(response.body.data.user.lastName).to.equal('');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await seedUser({
        username: 'loginuser',
        email: 'login@example.com',
        passwordHash: 'SecurePass123'
      });
    });

    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.have.keys('user', 'accessToken', 'expiresIn');
      expect(response.body.data.user.email).to.equal('login@example.com');
      expect(response.body.data.user).to.not.have.property('passwordHash');
      expect(response.body.data.accessToken).to.be.a('string');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPass123'
        });

      expect(response.status).to.equal(401);
      expect(response.body.status).to.equal('error');
      expect(response.body.message).to.include('Invalid email or password');
      expect(response.body.code).to.equal('INVALID_CREDENTIALS');
      expect(response.body).to.not.have.property('data');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(401);
      expect(response.body.message).to.include('Invalid email or password');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.include('Validation failed');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('password');
    });

    it('should update lastLogin timestamp', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).to.equal(200);
      const lastLogin = response.body.data.user.lastLogin;
      expect(lastLogin).to.exist;
      expect(new Date(lastLogin)).to.be.instanceOf(Date);
    });
  });

  describe('GET /api/auth/profile', () => {
    let validToken;
    let userId;

    beforeEach(async () => {
      const user = await seedUser({ username: 'profileuser' });
      userId = user._id.toString();
      validToken = AuthService.generateToken({
        id: userId,
        email: user.email,
        username: user.username
      });
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data).to.have.keys('user');
      expect(response.body.data.user.username).to.equal('profileuser');
      expect(response.body.data.user).to.not.have.property('passwordHash');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).to.equal(401);
      expect(response.body.message).to.include('Access token is required');
      expect(response.body.code).to.equal('NO_TOKEN');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('INVALID_TOKEN');
    });

    it('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });

    it('should reject request with expired token', async () => {
      const expiredToken = AuthService.generateToken({
        id: userId,
        email: 'profileuser@example.com',
        username: 'profileuser'
      }, '1ms');

      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', authHeader(expiredToken));

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('TOKEN_EXPIRED');
      expect(response.body.status).to.equal('error');
    });

    it('should return 404 for deleted user', async () => {
      // Create token for user
      const validTokenForDeletedUser = AuthService.generateToken({
        id: '507f1f77bcf86cd799439011', // Non-existent user ID
        email: 'deleted@example.com'
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', authHeader(validTokenForDeletedUser));

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('USER_NOT_FOUND');
    });
  });

  describe('Health Check Routes', () => {
    it('should return health status on /api/health', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('healthy');
      expect(response.body.timestamp).to.exist;
    });

    it('should require authentication for /api/health/protected', async () => {
      const response = await request(app)
        .get('/api/health/protected');

      expect(response.status).to.equal(401);
    });

    it('should allow access to protected health check with token', async () => {
      const user = await seedUser();
      const token = AuthService.generateToken({
        id: user._id.toString(),
        email: user.email
      });

      const response = await request(app)
        .get('/api/health/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.user).to.exist;
    });
  });
});
