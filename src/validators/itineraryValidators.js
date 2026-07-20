const { body, param, query } = require('express-validator');

/**
 * Create itinerary validation rules
 */
const createItineraryValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID'),

  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('activityDate')
    .isISO8601()
    .withMessage('Activity date must be a valid ISO 8601 date'),

  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),

  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a positive number'),

  body('status')
    .optional()
    .isIn(['planned', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority')
];

/**
 * Update itinerary validation rules
 */
const updateItineraryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid itinerary ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('activityDate')
    .optional()
    .isISO8601()
    .withMessage('Activity date must be a valid ISO 8601 date'),

  body('time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),

  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated cost must be a positive number'),

  body('status')
    .optional()
    .isIn(['planned', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority')
];

/**
 * Trip ID parameter validation
 */
const tripIdValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID')
];

/**
 * Itinerary ID parameter validation
 */
const itineraryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid itinerary ID')
];

/**
 * Search validation
 */
const itinerarySearchValidation = [
  query('status')
    .optional()
    .isIn(['planned', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),

  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
];

module.exports = {
  createItineraryValidation,
  updateItineraryValidation,
  tripIdValidation,
  itineraryIdValidation,
  itinerarySearchValidation
};
