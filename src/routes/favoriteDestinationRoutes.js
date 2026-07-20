const express = require('express');
const FavoriteDestinationController = require('../controllers/FavoriteDestinationController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createFavoriteDestinationValidation,
  updateFavoriteDestinationValidation,
  favoriteDestinationIdValidation,
  favoriteDestinationFilterValidation
} = require('../validators/favoriteDestinationValidators');

const router = express.Router();

/**
 * GET /api/favorite-destinations
 * List authenticated user's favorite destinations
 */
router.get(
  '/favorite-destinations',
  authenticateToken,
  favoriteDestinationFilterValidation,
  handleValidationErrors,
  FavoriteDestinationController.getMyFavoriteDestinations
);

/**
 * GET /api/favorite-destinations/summary
 * Get authenticated user's favorite destination summary
 */
router.get(
  '/favorite-destinations/summary',
  authenticateToken,
  FavoriteDestinationController.getMyFavoriteDestinationSummary
);

/**
 * GET /api/favorite-destinations/:id
 * Get authenticated user's single favorite destination
 */
router.get(
  '/favorite-destinations/:id',
  authenticateToken,
  favoriteDestinationIdValidation,
  handleValidationErrors,
  FavoriteDestinationController.getFavoriteDestinationById
);

/**
 * POST /api/favorite-destinations
 * Create favorite destination
 */
router.post(
  '/favorite-destinations',
  authenticateToken,
  createFavoriteDestinationValidation,
  handleValidationErrors,
  FavoriteDestinationController.createFavoriteDestination
);

/**
 * PUT /api/favorite-destinations/:id
 * Update favorite destination
 */
router.put(
  '/favorite-destinations/:id',
  authenticateToken,
  updateFavoriteDestinationValidation,
  handleValidationErrors,
  FavoriteDestinationController.updateFavoriteDestination
);

/**
 * DELETE /api/favorite-destinations/:id
 * Delete favorite destination
 */
router.delete(
  '/favorite-destinations/:id',
  authenticateToken,
  favoriteDestinationIdValidation,
  handleValidationErrors,
  FavoriteDestinationController.deleteFavoriteDestination
);

module.exports = router;
