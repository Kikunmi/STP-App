const UserRepository = require('../repositories/UserRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const userRepository = new UserRepository();

/**
 * User Management Controller
 * Handles user profile management operations
 */
class UserController {
  /**
   * Update user profile (firstName, lastName)
   * PUT /api/users/profile
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // If no updates provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field must be provided for update',
        code: 'NO_UPDATE_FIELDS'
      });
    }

    // Update user
    const updatedUser = await userRepository.findByIdAndUpdate(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser.toJSON() }
    });
  });

  /**
   * Update username
   * PUT /api/users/username
   */
  static updateUsername = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;

    // Check if new username is different from current
    const currentUser = await userRepository.findById(userId);
    if (currentUser.username === username) {
      return res.status(400).json({
        status: 'error',
        message: 'New username must be different from current username',
        code: 'SAME_USERNAME'
      });
    }

    // Check if username already taken
    const usernameExists = await userRepository.usernameExists(username, userId);
    if (usernameExists) {
      return res.status(409).json({
        status: 'error',
        message: 'Username is already taken',
        code: 'USERNAME_EXISTS'
      });
    }

    // Update username
    const updatedUser = await userRepository.findByIdAndUpdate(userId, { username });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser.toJSON() }
    });
  });

  /**
   * Change password
   * POST /api/users/change-password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await userRepository.model.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      data: {}
    });
  });

  /**
   * Delete user account
   * DELETE /api/users/account
   */
  static deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    // Get user with password hash for verification
    const user = await userRepository.model.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Delete user
    await userRepository.findByIdAndDelete(userId);

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully',
      data: {}
    });
  });

  /**
   * Get all users (admin feature)
   * GET /api/users
   * Query params: page, limit, sort
   */
  static getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get users with pagination
    const [users, total] = await Promise.all([
      userRepository.find({}, { skip, limit: limitNum, sort: { [sort]: -1 } }),
      userRepository.count({})
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(u => u.toJSON()),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages
        }
      }
    });
  });

  /**
   * Search users
   * GET /api/users/search
   * Query params: q (search query), type (username|email)
   */
  static searchUsers = asyncHandler(async (req, res) => {
    const { q, type = 'username' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters',
        code: 'INVALID_SEARCH_QUERY'
      });
    }

    let query = {};
    if (type === 'email') {
      query.email = new RegExp(q, 'i');
    } else {
      query.username = new RegExp(q, 'i');
    }

    const users = await userRepository.find(query, { limit: 20 });

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(u => u.toJSON()),
        count: users.length
      }
    });
  });
}

module.exports = UserController;
