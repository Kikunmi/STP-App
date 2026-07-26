const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../../src/config/database');
const AuthService = require('../../src/services/AuthService');
const { clearCollection, seedUser } = require('../../src/utils/database');

describe('AuthService', () => {
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

  describe('Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = AuthService.generateToken(payload);

      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.lengthOf(3); // JWT format: header.payload.signature
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { id: '123', email: 'test1@example.com' };
      const payload2 = { id: '456', email: 'test2@example.com' };

      const token1 = AuthService.generateToken(payload1);
      const token2 = AuthService.generateToken(payload2);

      expect(token1).to.not.equal(token2);
    });

    it('should generate token with custom expiration', () => {
      const payload = { id: '123' };
      const token = AuthService.generateToken(payload, '1h');

      const decoded = AuthService.decodeToken(token);
      expect(decoded.exp).to.exist;
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid token', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = AuthService.generateToken(payload);

      const verified = AuthService.verifyToken(token);

      expect(verified.id).to.equal('123');
      expect(verified.email).to.equal('test@example.com');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        AuthService.verifyToken(invalidToken);
      }).to.throw();
    });

    it('should throw error for tampered token', () => {
      const payload = { id: '123' };
      const token = AuthService.generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => {
        AuthService.verifyToken(tamperedToken);
      }).to.throw();
    });

    it('should throw error for expired token', async () => {
      const token = AuthService.generateToken({ id: '123' }, '1ms');

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(() => {
        AuthService.verifyToken(token);
      }).to.throw('Token verification failed');
    });
  });

  describe('Token Decoding', () => {
    it('should decode token without verification', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = AuthService.generateToken(payload);

      const decoded = AuthService.decodeToken(token);

      expect(decoded.id).to.equal('123');
      expect(decoded.email).to.equal('test@example.com');
    });

    it('should return null for invalid token format', () => {
      const decoded = AuthService.decodeToken('invalid');

      expect(decoded).to.be.null;
    });
  });

  describe('Auth Response Creation', () => {
    it('should create auth response with user and token', async () => {
      const user = await seedUser();

      const response = AuthService.createAuthResponse(user);

      expect(response.status).to.equal('success');
      expect(response.data).to.have.keys('user', 'accessToken', 'expiresIn');
      expect(response.data.user).to.include.keys('_id', 'username', 'email', 'firstName', 'lastName', 'isActive', 'lastLogin', 'createdAt', 'updatedAt');
      expect(response.data.accessToken).to.be.a('string');
    });

    it('should not include password in response', async () => {
      const user = await seedUser();

      const response = AuthService.createAuthResponse(user);

      expect(response.data.user).to.not.have.property('passwordHash');
    });

    it('should include correct token claims', async () => {
      const user = await seedUser({ 
        username: 'testuser',
        email: 'test@example.com'
      });

      const response = AuthService.createAuthResponse(user);
      const decoded = AuthService.decodeToken(response.data.accessToken);

      expect(decoded.id).to.equal(user._id.toString());
      expect(decoded.email).to.equal('test@example.com');
      expect(decoded.username).to.equal('testuser');
    });
  });
});
