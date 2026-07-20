const { body, param, query } = require('express-validator');

const expenseCategories = ['transport', 'accommodation', 'food', 'activity', 'shopping', 'other'];
const paymentMethods = ['cash', 'card', 'transfer', 'mobile', 'other'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'NGN'];

/**
 * Create expense validation
 */
const createExpenseValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID'),

  body('title')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Title must be between 2 and 120 characters'),

  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .optional()
    .isIn(expenseCategories)
    .withMessage('Invalid category'),

  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('currency')
    .optional()
    .isIn(currencies)
    .withMessage('Invalid currency'),

  body('paymentMethod')
    .optional()
    .isIn(paymentMethods)
    .withMessage('Invalid payment method')
];

/**
 * Update expense validation
 */
const updateExpenseValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Title must be between 2 and 120 characters'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .optional()
    .isIn(expenseCategories)
    .withMessage('Invalid category'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('currency')
    .optional()
    .isIn(currencies)
    .withMessage('Invalid currency'),

  body('paymentMethod')
    .optional()
    .isIn(paymentMethods)
    .withMessage('Invalid payment method')
];

/**
 * Trip ID param validation
 */
const tripIdValidation = [
  param('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID')
];

/**
 * Expense ID param validation
 */
const expenseIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID')
];

/**
 * Expense list filter validation
 */
const expenseFilterValidation = [
  query('category')
    .optional()
    .isIn(expenseCategories)
    .withMessage('Invalid category'),

  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('fromDate must be valid ISO 8601 date'),

  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('toDate must be valid ISO 8601 date')
];

module.exports = {
  createExpenseValidation,
  updateExpenseValidation,
  tripIdValidation,
  expenseIdValidation,
  expenseFilterValidation
};
