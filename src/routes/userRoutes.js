const express = require('express');
const UserController = require('../controllers/UserController');
const {
  updateProfileValidation,
  changePasswordValidation,
  updateUsernameValidation
} = require('../validators/userValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * PUT /api/users/profile
 * Update user profile (firstName, lastName)
 * Body: { firstName?, lastName? }
 * Returns: { status, data: { user } }
 */
router.put(
  '/profile',
  updateProfileValidation,
  handleValidationErrors,
  UserController.updateProfile
);

/**
 * PUT /api/users/username
 * Update username
 * Body: { username }
 * Returns: { status, data: { user } }
 */
router.put(
  '/username',
  updateUsernameValidation,
  handleValidationErrors,
  UserController.updateUsername
);

/**
 * POST /api/users/change-password
 * Change password
 * Body: { currentPassword, newPassword, confirmPassword }
 * Returns: { status, message, data }
 */
router.post(
  '/change-password',
  changePasswordValidation,
  handleValidationErrors,
  UserController.changePassword
);

/**
 * DELETE /api/users/account
 * Delete user account (requires password confirmation)
 * Body: { password }
 * Returns: { status, message, data }
 */
router.delete(
  '/account',
  UserController.deleteAccount
);

/**
 * GET /api/users
 * Get all users with pagination (public)
 * Query: { page?, limit?, sort? }
 * Returns: { status, data: { users, pagination } }
 */
router.get(
  '/',
  UserController.getAllUsers
);

/**
 * GET /api/users/search
 * Search users by username or email (public)
 * Query: { q, type? }
 * Returns: { status, data: { users, count } }
 */
router.get(
  '/search',
  UserController.searchUsers
);

module.exports = router;
