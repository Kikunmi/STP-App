const express = require('express');
const TripController = require('../controllers/TripController');
const {
  createTripValidation,
  updateTripValidation,
  paginationValidation,
  tripIdValidation,
  searchValidation
} = require('../validators/tripValidators');
const { handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/trips
 * Create a new trip
 * Body: { title, destination, startDate, endDate, budget?, currency?, description?, isPublic?, tags? }
 * Returns: { status, data: { trip } }
 */
router.post(
  '/',
  createTripValidation,
  handleValidationErrors,
  TripController.createTrip
);

/**
 * GET /api/trips
 * Get all trips for current user with pagination
 * Query: { page?, limit?, status?, sort? }
 * Returns: { status, data: { trips, pagination } }
 */
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  TripController.getUserTrips
);

/**
 * GET /api/trips/filter/upcoming
 * Get upcoming trips for current user
 * Returns: { status, data: { trips, count } }
 */
router.get(
  '/filter/upcoming',
  TripController.getUpcomingTrips
);

/**
 * GET /api/trips/filter/active
 * Get active trips for current user
 * Returns: { status, data: { trips, count } }
 */
router.get(
  '/filter/active',
  TripController.getActiveTrips
);

/**
 * GET /api/trips/search
 * Search trips by title, destination, or description
 * Query: { q, searchPublic? }
 * Returns: { status, data: { trips, count } }
 */
router.get(
  '/search',
  searchValidation,
  handleValidationErrors,
  TripController.searchTrips
);

/**
 * GET /api/trips/:id
 * Get a single trip by ID
 * Returns: { status, data: { trip } }
 */
router.get(
  '/:id',
  tripIdValidation,
  handleValidationErrors,
  TripController.getTripById
);

/**
 * PUT /api/trips/:id
 * Update a trip (owner only)
 * Body: { title?, destination?, startDate?, endDate?, budget?, currency?, description?, status?, isPublic? }
 * Returns: { status, data: { trip } }
 */
router.put(
  '/:id',
  tripIdValidation,
  updateTripValidation,
  handleValidationErrors,
  TripController.updateTrip
);

/**
 * DELETE /api/trips/:id
 * Delete a trip (owner only)
 * Returns: { status, message, data }
 */
router.delete(
  '/:id',
  tripIdValidation,
  handleValidationErrors,
  TripController.deleteTrip
);

module.exports = router;
