const express = require('express');
const RecommendationController = require('../controllers/RecommendationController');
const { generateRecommendationValidation } = require('../validators/recommendationValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/recommendations/generate
 * Generate travel recommendations for a destination or trip
 * Body: { tripId?, destination?, startDate?, endDate?, budget?, preferences? }
 * Returns: { status, message, data: { recommendation } }
 */
router.post(
  '/recommendations/generate',
  authenticateToken,
  generateRecommendationValidation,
  handleValidationErrors,
  RecommendationController.generateRecommendations
);

/**
 * GET /api/recommendations
 * List the authenticated user's recommendations
 * Returns: { status, data: { recommendations, pagination } }
 */
router.get(
  '/recommendations',
  authenticateToken,
  RecommendationController.getMyRecommendations
);

/**
 * GET /api/trips/:tripId/recommendations
 * List recommendations for a specific trip
 * Returns: { status, data: { recommendations, count } }
 */
router.get(
  '/trips/:tripId/recommendations',
  authenticateToken,
  RecommendationController.getTripRecommendations
);

module.exports = router;
