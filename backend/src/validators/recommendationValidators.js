const { body } = require('express-validator');

/**
 * Validation rules for POST /api/recommendations/generate
 *
 * Either `tripId` OR `destination` must be provided:
 * - If `tripId` is given, it must be a valid Mongo ObjectId.
 * - If `tripId` is absent, `destination` is required.
 */
const generateRecommendationValidation = [
  body('tripId')
    .optional()
    .isMongoId()
    .withMessage('tripId must be a valid Mongo ID'),

  body('destination')
    .if(body('tripId').not().exists())
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('destination is required and must be between 2 and 100 characters'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('endDate must be after startDate');
      }
      return true;
    }),

  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('budget must be a non-negative number'),

  body('preferences')
    .optional()
    .isArray()
    .withMessage('preferences must be an array')
    .bail()
    .custom((arr) => {
      if (arr.some(p => typeof p !== 'string' || p.trim().length === 0)) {
        throw new Error('Each preference must be a non-empty string');
      }
      return true;
    })
];

module.exports = {
  generateRecommendationValidation
};
