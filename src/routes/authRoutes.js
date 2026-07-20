const express = require('express');
const AuthController = require('../controllers/AuthController');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username, email, password, firstName?, lastName? }
 * Returns: { status, data: { user, accessToken, expiresIn } }
 */
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

/**
 * POST /api/auth/login
 * Login user
 * Body: { email, password }
 * Returns: { status, data: { user, accessToken, expiresIn } }
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 * Headers: { Authorization: "Bearer <token>" }
 * Returns: { status, data: { user } }
 */
router.get(
  '/profile',
  authenticateToken,
  AuthController.getProfile
);

module.exports = router;
