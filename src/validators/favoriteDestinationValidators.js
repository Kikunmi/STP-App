const { body, param, query } = require('express-validator');

/**
 * Create favorite destination validation
 */
const createFavoriteDestinationValidation = [
  body('destinationName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Destination name must be between 2 and 120 characters'),

  body('country')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Country must be between 2 and 80 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('City must not exceed 80 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('tags')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Tags must be an array with at most 15 items'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each tag must be between 1 and 40 characters'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('visited')
    .optional()
    .isBoolean()
    .withMessage('Visited must be a boolean value')
];

/**
 * Update favorite destination validation
 */
const updateFavoriteDestinationValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid favorite destination ID'),

  body('destinationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Destination name must be between 2 and 120 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Country must be between 2 and 80 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('City must not exceed 80 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('tags')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Tags must be an array with at most 15 items'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Each tag must be between 1 and 40 characters'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('visited')
    .optional()
    .isBoolean()
    .withMessage('Visited must be a boolean value')
];

/**
 * Favorite destination ID validation
 */
const favoriteDestinationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid favorite destination ID')
];

/**
 * Favorite destination filters validation
 */
const favoriteDestinationFilterValidation = [
  query('visited')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Visited filter must be true or false'),

  query('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Country must be between 2 and 80 characters'),

  query('tag')
    .optional()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('Tag must be between 1 and 40 characters')
];

module.exports = {
  createFavoriteDestinationValidation,
  updateFavoriteDestinationValidation,
  favoriteDestinationIdValidation,
  favoriteDestinationFilterValidation
};
