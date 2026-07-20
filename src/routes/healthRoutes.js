const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 * Returns: { status, message, timestamp }
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/protected
 * Protected health check endpoint (requires authentication)
 * Returns: { status, message, timestamp, user }
 */
router.get('/health/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Protected endpoint is healthy',
    timestamp: new Date().toISOString(),
    user: req.user
  });
});

module.exports = router;
