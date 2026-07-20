const { body, param } = require('express-validator');

const shareTripValidation = [
  body('identifier')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Identifier must be between 3 and 100 characters'),

  body('identifierType')
    .optional()
    .isIn(['email', 'username'])
    .withMessage('identifierType must be either email or username')
];

const sharedTripIdValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID')
];

const unshareTripValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID'),

  param('sharedUserId')
    .isMongoId()
    .withMessage('Invalid shared user ID')
];

module.exports = {
  shareTripValidation,
  sharedTripIdValidation,
  unshareTripValidation
};
