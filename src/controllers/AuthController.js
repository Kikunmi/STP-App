const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');
const { asyncHandler } = require('../middleware/errorHandler');

const userRepository = new UserRepository();

class AuthController {
  // POST /api/auth/register
  static register = asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    let user;
    try {
      user = await userRepository.createUser({
        username,
        email: email.toLowerCase(),
        passwordHash: password,
        firstName,
        lastName
      });
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Email already in use')) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }
      if (msg.includes('Username already in use')) {
        return res.status(409).json({
          status: 'error',
          message: 'Username is already taken',
          code: 'USERNAME_EXISTS'
        });
      }
      throw err;
    }

    const authResponse = AuthService.createAuthResponse(user);

    res.status(201).json(authResponse);
  });

  // POST /api/auth/login
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // update last login
    await userRepository.updateLastLogin(user._id);
    user.lastLogin = new Date();

    const authResponse = AuthService.createAuthResponse(user);

    res.status(200).json(authResponse);
  });

  // GET /api/auth/profile
  static getProfile = asyncHandler(async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const profile = await userRepository.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    res.status(200).json({ status: 'success', data: { user: profile } });
  });
}

module.exports = AuthController;
