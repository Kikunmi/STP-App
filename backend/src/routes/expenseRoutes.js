const express = require('express');
const ExpenseController = require('../controllers/ExpenseController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createExpenseValidation,
  updateExpenseValidation,
  tripIdValidation,
  expenseIdValidation,
  expenseFilterValidation
} = require('../validators/expenseValidators');

const router = express.Router();

/**
 * GET /api/trips/:tripId/expenses
 * List expenses for a trip
 */
router.get(
  '/trips/:tripId/expenses',
  authenticateToken,
  tripIdValidation,
  expenseFilterValidation,
  handleValidationErrors,
  ExpenseController.getTripExpenses
);

/**
 * GET /api/trips/:tripId/expenses/summary
 * Get trip expense summary
 */
router.get(
  '/trips/:tripId/expenses/summary',
  authenticateToken,
  tripIdValidation,
  handleValidationErrors,
  ExpenseController.getExpenseSummary
);

/**
 * POST /api/trips/:tripId/expenses
 * Create expense for a trip
 */
router.post(
  '/trips/:tripId/expenses',
  authenticateToken,
  createExpenseValidation,
  handleValidationErrors,
  ExpenseController.createExpense
);

/**
 * PUT /api/expenses/:id
 * Update expense
 */
router.put(
  '/expenses/:id',
  authenticateToken,
  updateExpenseValidation,
  handleValidationErrors,
  ExpenseController.updateExpense
);

/**
 * DELETE /api/expenses/:id
 * Delete expense
 */
router.delete(
  '/expenses/:id',
  authenticateToken,
  expenseIdValidation,
  handleValidationErrors,
  ExpenseController.deleteExpense
);

module.exports = router;
