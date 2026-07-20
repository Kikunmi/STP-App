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

module.exports = router;
