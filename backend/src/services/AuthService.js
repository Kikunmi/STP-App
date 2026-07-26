const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');

/**
 * Authentication Service
 * Handles JWT token generation, validation, and user authentication
 */
class AuthService {
  /**
   * Generate JWT token
   * @param {Object} payload - Token payload (usually user data)
   * @param {string} expiresIn - Token expiration time (optional, defaults to config)
   * @returns {string} JWT token
   */
  static generateToken(payload, expiresIn = config.jwt.expire) {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn,
        algorithm: 'HS256'
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256']
      });
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Create authentication response with tokens
   * @param {Object} user - User object
   * @returns {Object} Authentication response
   */
  static createAuthResponse(user) {
    try {
      const payload = {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      };

      const accessToken = this.generateToken(payload, config.jwt.expire);

      return {
        status: 'success',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: config.jwt.expire
        }
      };
    } catch (error) {
      throw new Error(`Auth response creation failed: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for testing)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Token decode failed: ${error.message}`);
    }
  }
}

module.exports = AuthService;
