const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (err) {
        const message = err.name === 'TokenExpiredError' 
          ? 'Access token has expired'
          : 'Invalid access token';
        
        return res.status(403).json({
          status: 'error',
          message,
          code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_ERROR'
    });
  }
};

module.exports = {
  authenticateToken
};
