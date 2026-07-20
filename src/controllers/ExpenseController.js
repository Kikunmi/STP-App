const ExpenseRepository = require('../repositories/ExpenseRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const expenseRepository = new ExpenseRepository();

class ExpenseController {
  static getTripExpenses = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const { category, fromDate, toDate } = req.query;

    const expenses = await expenseRepository.findByTripId(tripId, { category, fromDate, toDate });

    res.status(200).json({
      status: 'success',
      data: {
        expenses,
        count: expenses.length
      }
    });
  });

  static getExpenseSummary = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const summary = await expenseRepository.getTripSummary(tripId);

    res.status(200).json({ status: 'success', data: { summary } });
  });

  static createExpense = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const payload = {
      ...req.body,
      tripId
    };

    const expense = await expenseRepository.createExpense(payload);

    res.status(201).json({ status: 'success', data: { expense } });
  });

  static updateExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await expenseRepository.findByIdAndUpdate(id, req.body);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Expense not found' });
    }

    res.status(200).json({ status: 'success', data: { expense: updated } });
  });

  static deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await expenseRepository.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Expense not found' });
    }

    res.status(200).json({ status: 'success', message: 'Expense deleted successfully' });
  });
}

module.exports = ExpenseController;
