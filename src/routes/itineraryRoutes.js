const express = require('express');
const ItineraryController = require('../controllers/ItineraryController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createItineraryValidation,
  updateItineraryValidation,
  tripIdValidation,
  itineraryIdValidation,
  itinerarySearchValidation
} = require('../validators/itineraryValidators');

const router = express.Router();

/**
 * GET /api/trips/:tripId/itinerary
 * Get itinerary items for a trip
 */
router.get(
  '/trips/:tripId/itinerary',
  authenticateToken,
  tripIdValidation,
  itinerarySearchValidation,
  handleValidationErrors,
  ItineraryController.getTripItinerary
);

/**
 * POST /api/trips/:tripId/itinerary
 * Create itinerary item for trip (owner only)
 */
router.post(
  '/trips/:tripId/itinerary',
  authenticateToken,
  createItineraryValidation,
  handleValidationErrors,
  ItineraryController.createItinerary
);

/**
 * PUT /api/itinerary/:id
 * Update itinerary item (owner only)
 */
router.put(
  '/itinerary/:id',
  authenticateToken,
  updateItineraryValidation,
  handleValidationErrors,
  ItineraryController.updateItinerary
);

/**
 * DELETE /api/itinerary/:id
 * Delete itinerary item (owner only)
 */
router.delete(
  '/itinerary/:id',
  authenticateToken,
  itineraryIdValidation,
  handleValidationErrors,
  ItineraryController.deleteItinerary
);

module.exports = router;
